import { Pencil, Trash2, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function ProductCard({ product, onEdit, onDelete }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const navigate = useNavigate();

  console.log("✅ PRODUCT FROM API:", product);
  console.log("🖼️ PRODUCT IMAGE:", product?.image);

  // =====================================================
  // BUILD IMAGE URL
  // =====================================================

  const getImageUrl = () => {
    if (!product?.image) {
      return null;
    }

    const image = String(product.image).trim();

    // Pexels / external URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Local uploaded image
    return `${API_BASE_URL}/uploads/${encodeURIComponent(
      image
    )}`;
  };

  const imageUrl = getImageUrl();

  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const openProduct = () => {
    console.log(
      "CLICKED PRODUCT ID:",
      product.id
    );

    navigate(`/products/${product.id}`);
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        transition
        duration-300
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-xl
      "
    >
      {/* Product Image */}
      <div
        onClick={openProduct}
        className="
          relative
          h-52
          w-full
          cursor-pointer
          overflow-hidden
          bg-slate-800
        "
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-300
              hover:scale-105
              hover:opacity-90
            "
            onError={(e) => {
              console.error(
                "❌ IMAGE LOAD FAILED:",
                imageUrl
              );

              e.currentTarget.style.display =
                "none";

              const fallback =
                e.currentTarget.parentElement.querySelector(
                  ".image-fallback"
                );

              if (fallback) {
                fallback.classList.remove(
                  "hidden"
                );
              }
            }}
          />
        ) : null}

        {/* Fallback */}
        <div
          className={`image-fallback absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600 ${
            imageUrl
              ? "hidden"
              : ""
          }`}
        >
          <ImageOff size={32} />

          <span className="text-sm">
            No image available
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5">
        {/* Product Name */}
        <h2
          onClick={openProduct}
          className="
            cursor-pointer
            text-xl
            font-semibold
            text-white
            transition
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
              onClick={() =>
                onEdit(product)
              }
              className="
                flex-1
                rounded-lg
                bg-yellow-500
                py-2
                text-white
                transition
                hover:bg-yellow-600
              "
            >
              <Pencil
                className="mx-auto"
                size={18}
              />
            </button>

            <button
              onClick={() =>
                onDelete(product)
              }
              className="
                flex-1
                rounded-lg
                bg-red-600
                py-2
                text-white
                transition
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