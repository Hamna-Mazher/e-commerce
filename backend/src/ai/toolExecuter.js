const {
  executeProductTool,
} = require("./tools/productTools");

const {
  executeOrderTool,
} = require("./tools/orderTools");

const {
  executeLookupTool,
} = require("./tools/lookupTools");
const {
  executeTaskTool,
} = require("./tools/taskTools");
// =====================================================
// EXECUTE AI TOOL
// =====================================================

const executeTool = async ({
  name,
  arguments: toolArguments,
  user,
}) => {
  // ===================================================
  // AUTHENTICATION
  // ===================================================

  if (!user) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  // ===================================================
  // PRODUCT TOOLS
  // ===================================================

  const productToolNames = [
    "create_product",
    "update_product",
    "delete_product",
  ];

  if (
    productToolNames.includes(name)
  ) {
    return executeProductTool({
      name,
      arguments: toolArguments,
      user,
    });
  }

  // ===================================================
  // ORDER TOOLS
  // ===================================================

  const orderToolNames = [
    "create_order",
    "delete_order",
  ];

  if (
    orderToolNames.includes(name)
  ) {
    return executeOrderTool({
      name,
      arguments: toolArguments,
      user,
    });
  }

  // ===================================================
  // LOOKUP / READ TOOLS
  // ===================================================

  const lookupToolNames = [
    "find_user",
    "find_product",
    "list_products",
    "list_orders",
    "list_tasks",
  ];

  if (
    lookupToolNames.includes(name)
  ) {
    return executeLookupTool({
      name,
      arguments: toolArguments,

      // IMPORTANT:
      // Pass authenticated user so lookup tools
      // can enforce ownership/role permissions.
      user,
    });
  }
// ===================================================
// TASK TOOLS
// ===================================================

const taskToolNames = [
  "create_task",
  "update_task",
  "delete_task",
];

if (
  taskToolNames.includes(name)
) {
  return executeTaskTool({
    name,
    arguments: toolArguments,
    user,
  });
}
  // ===================================================
  // UNKNOWN TOOL
  // ===================================================

  throw new Error(
    `Unknown AI tool: ${name}`
  );
};

module.exports = {
  executeTool,
};