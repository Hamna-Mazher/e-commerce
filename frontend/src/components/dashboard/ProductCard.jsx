import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, onEdit, onDelete }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  console.log("✅ PRODUCT FROM API:", product);

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
        transition
        duration-300
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-xl
      "
    >
      {/* Product Image */}
      <img
        onClick={() => {
          console.log("CLICKED PRODUCT ID:", product.id);

          navigate(`/products/${product.id}`);
        }}
        src={`http://localhost:5000/uploads/${product.image}`}
        alt={product.name}
        className="
          h-52
          w-full
          cursor-pointer
          object-cover
          transition
          hover:opacity-90
        "
      />

      <div className="p-5">

        {/* Product Name */}
        <h2
          onClick={() => {
            console.log("CLICKED PRODUCT ID:", product.id);

            navigate(`/products/${product.id}`);
          }}
          className="
            cursor-pointer
            text-xl
            font-semibold
            hover:text-blue-400
          "
        >
          {product.name}
        </h2>

        {/* Category */}
        <p className="mt-2 text-gray-400">
          {product.category}
        </p>

        {/* Price */}
        <p className="mt-4 text-2xl font-bold text-blue-400">
          ${product.price}
        </p>

        {/* Admin Buttons */}
        {user?.role === "Admin" && (
          <div className="mt-6 flex gap-3">

            <button
              onClick={() => onEdit(product)}
              className="
                flex-1
                rounded-lg
                bg-yellow-500
                py-2
                hover:bg-yellow-600
              "
            >
              <Pencil
                className="mx-auto"
                size={18}
              />
            </button>

            <button
              onClick={() => onDelete(product)}
              className="
                flex-1
                rounded-lg
                bg-red-600
                py-2
                hover:bg-red-700
              "
            >
              <Trash2
                className="mx-auto"
                size={18}
              />
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default ProductCard;