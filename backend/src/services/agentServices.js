const openai = require("../config/openai");

const {
  productTools,
} = require("../ai/tools/productTools");

const {
  executeTool,
} = require("../ai/toolExecuter");

const {
  orderTools,
} = require("../ai/tools/orderTools");

const {
  lookupTools,
} = require("../ai/tools/lookupTools");
const {
  taskTools,
} = require("../ai/tools/taskTools");
// =====================================================
// BASE INSTRUCTIONS
// =====================================================

const BASE_INSTRUCTIONS = `
You are an AI assistant for an ecommerce and task management application.

You can answer questions about the application and perform actions
using the tools provided to you.

GENERAL RULES:

1. Only perform an action when the user explicitly requests it.
2. Never invent product IDs, order IDs, user IDs, prices, or other values.
3. If required information is missing, ask the user for it.
4. Never generate or execute SQL.
5. Never claim an action succeeded unless the tool returned success.
6. Keep responses concise and useful.
7. Respect the authenticated user's permissions.
8. Do not ask the user to confirm their role. The application already
   knows the authenticated user's role.

IMPORTANT PEXELS RULE:

Pexels image search IS available through the create_product and
update_product tools.

NEVER tell the Admin that Pexels image search is unavailable.

When the Admin asks to:
- "find an image"
- "find a suitable image"
- "add an image"
- "use an image"
- "give me product images"
- "replace the image"

you MUST use the appropriate product tool with imageQuery.

Do not ask the Admin to upload an image when a Pexels image was requested.

PRODUCT CREATION:

1. Product creation requires:
   - name
   - price
   - category

2. Product description is optional.
3. Never invent a product price.
4. Product image is optional.
5. If the Admin requests an image, ALWAYS call create_product
   with a useful imageQuery.
6. The create_product tool will search Pexels and return image
   candidates for Admin selection.
7. Do NOT claim that image search is unavailable.

PRODUCT UPDATES:

1. Product ID is required.
2. Only modify fields explicitly mentioned by the Admin.
3. Do not ask for unchanged product fields.
4. The system retrieves the existing product and preserves unchanged fields.
5. Multiple requested changes should be performed in one update.
6. If the Admin requests a new image, use imageQuery.
7. The update_product tool will search Pexels and return candidates.

PRODUCT DELETION:

1. Product ID is required.
2. Only delete when the Admin explicitly requests deletion.

ORDER ACTIONS:

1. Only Admin users can perform Admin order-management actions.
2. Never invent user IDs or product IDs.
3. Use lookup tools when names are provided instead of IDs.
4. If several records match and the correct one is unclear, ask for clarification.
5. Never invent prices or totals.
RESPONSE FORMATTING RULES:

1. Always format responses for a chat interface.
2. Never use Markdown tables.
3. Never show raw Markdown formatting characters such as:
   **, __, ###, or table separator lines.
4. Use clear headings for sections.
5. Use numbered lists for ordered items.
6. Use bullet points for details.
7. Use bold headings only when the chat UI renders Markdown.
8. Keep each item separated with spacing for readability.
9. For lists of products, orders, tasks, or meetings:
   - Use a numbered list for each record.
   - Put the main item name as the first line.
   - Put its details underneath using bullet points.
10. For summaries, use a separate heading followed by bullet points.
11. Do not use tables unless the user explicitly asks for a table.
12. Keep monetary values consistently formatted.
13. Keep responses concise and easy to scan.

TASK ACTIONS:

1. Users can create tasks for themselves.
2. The authenticated user's ID must always be used as createdBy.
3. Never invent a task ID.
4. For task creation, title is required.
5. Description is optional.
6. Default status is Todo.
7. Default priority is Medium.
8. dueDate is optional.
9. Only perform task creation, update, or deletion when explicitly requested.
10. When updating a task, only change fields explicitly mentioned by the user.
`;

// =====================================================
// RUN AGENT
// =====================================================

const runAgent = async ({
  question,
  user,
  history = [],
}) => {
  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !question ||
    !question.trim()
  ) {
    throw new Error(
      "Question is required."
    );
  }

  if (!user) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  // ===================================================
  // ROLE
  // ===================================================

  const isAdmin =
    user.role === "Admin";

// ===================================================
// ROLE-AWARE INSTRUCTIONS
// ===================================================

const instructions = `
${BASE_INSTRUCTIONS}

CURRENT AUTHENTICATED USER:

User ID: ${user.id}
Role: ${user.role}

${
  isAdmin
    ? `
The current authenticated user is an ADMIN.

Available Admin actions:

PRODUCTS:
- create products
- update products
- delete products
- search Pexels images for products

ORDERS:
- place orders
- delete orders

The Admin can also use read-only lookup tools to:
- list products
- list orders
- list tasks
- find users
- find products

When the Admin asks for a product image, DO NOT refuse.
Use the product tool's imageQuery field.

Examples:

"Create earrings for 1500 and find a suitable image."
→ call create_product
→ imageQuery should be similar to "elegant women's earrings jewelry"

"Add a gaming mouse and show me some images."
→ call create_product
→ imageQuery should describe a gaming mouse

"Replace product 10 image with a black headset image."
→ call update_product
→ imageQuery should describe a black wireless gaming headset

Never say that the image-search tool is unavailable.
`
    : `
The current authenticated user is a NORMAL USER.

The User may ask questions about information they are allowed to access,
but cannot perform Admin-only product or order-management actions.

The User can use read-only lookup tools to view information they
are allowed to access.

Users can:
- view products
- view their own orders
- view their own tasks
- create their own tasks
- update their own tasks
- delete their own tasks

Users must never receive another user's private orders or tasks.

Do not use Admin-only action tools.
`
}
`;



  // ===================================================
  // BUILD CONVERSATION
  // ===================================================

  const input = history
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  input.push({
    role: "user",
    content: question.trim(),
  });

  // ===================================================
  // AVAILABLE TOOLS
  // ===================================================

const tools = isAdmin
  ? [
      ...productTools,
      ...orderTools,
      ...taskTools,
      ...lookupTools,
    ]
  : [
      ...lookupTools.filter(
        (tool) =>
          tool.name === "find_product" ||
          tool.name === "list_products" ||
          tool.name === "list_orders" ||
          tool.name === "list_tasks"
      ),
    ];

  console.log(
    "🤖 Available AI tools:",
    tools.map(
      (tool) => tool.name
    )
  );

  // ===================================================
  // FIRST REQUEST
  // ===================================================

  let currentResponse =
    await openai.responses.create({
      model:
        process.env.OPENAI_CHAT_MODEL ||
        "gpt-5.6-luna",

      instructions,

      tools,

      input,
    });

  // ===================================================
  // TOOL LOOP
  // ===================================================

  for (
    let round = 0;
    round < 5;
    round++
  ) {
    const functionCalls =
      currentResponse.output.filter(
        (item) =>
          item.type ===
          "function_call"
      );

    // =================================================
    // NO TOOL CALL
    // =================================================

    if (
      functionCalls.length === 0
    ) {
      return {
        answer:
          currentResponse.output_text ||
          "I could not generate an answer.",

        action: null,
      };
    }

    console.log(
      "🔧 AI function calls:",
      functionCalls.map(
        (call) => call.name
      )
    );

    const toolOutputs = [];

    // =================================================
    // EXECUTE TOOLS
    // =================================================

    for (
      const call of functionCalls
    ) {
      try {
        console.log(
          "🔧 Tool:",
          call.name
        );

        console.log(
          "📦 Arguments:",
          call.arguments
        );

        const result =
          await executeTool({
            name:
              call.name,

            arguments:
              call.arguments,

            user,
          });

        console.log(
          "✅ Tool result:",
          result
        );

        // =============================================
        // IMAGE SELECTION
        // =============================================

        if (
          result?.requiresImageSelection
        ) {
          return {
            answer:
              "I found suitable product images. Please select one to continue.",

            action: {
              ...result,

              toolName:
                call.name,

              callId:
                call.call_id,
            },
          };
        }

        // =============================================
        // NORMAL RESULT
        // =============================================

        toolOutputs.push({
          type:
            "function_call_output",

          call_id:
            call.call_id,

          output:
            JSON.stringify(
              result
            ),
        });
      } catch (error) {
        console.error(
          `❌ Tool execution error (${call.name}):`,
          error
        );

        toolOutputs.push({
          type:
            "function_call_output",

          call_id:
            call.call_id,

          output:
            JSON.stringify({
              success: false,

              error:
                error.message ||
                "Tool execution failed.",
            }),
        });
      }
    }

    // =================================================
    // SAFETY CHECK
    // =================================================

    if (
      toolOutputs.length === 0
    ) {
      return {
        answer:
          "I could not complete the requested action.",

        action: null,
      };
    }

    // =================================================
    // SEND TOOL RESULTS BACK
    // =================================================

    currentResponse =
      await openai.responses.create({
        model:
          process.env.OPENAI_CHAT_MODEL ||
          "gpt-5.6-luna",

        instructions,

        tools,

        previous_response_id:
          currentResponse.id,

        input:
          toolOutputs,
      });
  }

  throw new Error(
    "Maximum tool execution rounds exceeded."
  );
};

module.exports = {
  runAgent,
};