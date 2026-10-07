import { useState } from "react";
import {
  Check,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

function ProductImageSelector({
  action,
  onConfirm,
  loading = false,
}) {
  const [selectedImage, setSelectedImage] =
    useState(null);

  const images =
    action?.imageCandidates || [];

  const product =
    action?.product || {};

  if (images.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <ImageIcon
            size={20}
            className="text-blue-400"
          />

          <p className="font-medium text-white">
            No suitable images were found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 p-5">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon
            size={18}
            className="text-blue-400"
          />

          <h3 className="font-semibold text-white">
            Select Product Image
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Choose an image for{" "}
          <span className="font-medium text-white">
            {product.name || "this product"}
          </span>
        </p>
      </div>

      {/* Product Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">
              Product
            </p>

            <p className="mt-1 truncate text-sm font-medium text-white">
              {product.name || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Price
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {product.price ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Category
            </p>

            <p className="mt-1 truncate text-sm font-medium text-white">
              {product.category || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Image Options */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const isSelected =
            selectedImage?.id === image.id;

          const imageSource =
            image.largeImageUrl ||
            image.imageUrl ||
            image.originalImageUrl;

          return (
            <div
              key={image.id}
              className={`overflow-hidden rounded-xl border-2 transition ${
                isSelected
                  ? "border-blue-500 shadow-lg shadow-blue-500/10"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              {/* Select area */}
              <button
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                disabled={loading}
                className="group block w-full text-left disabled:cursor-not-allowed"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-800">
                  <img
                    src={imageSource}
                    alt={
                      image.alt ||
                      product.name ||
                      "Product image"
                    }
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        image.imageUrl ||
                        image.originalImageUrl ||
                        "";
                    }}
                  />

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                      <Check size={16} />
                    </div>
                  )}

                  {/* Select overlay */}
                  {!isSelected && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 opacity-0 transition group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">
                        Select this image
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Photographer */}
              <div className="bg-slate-900 p-3">
                <p className="truncate text-sm font-medium text-white">
                  {image.photographer ||
                    "Pexels Photographer"}
                </p>

                <a
                  href={image.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-blue-400"
                >
                  View on Pexels
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {selectedImage
            ? `Selected: ${
                selectedImage.photographer ||
                "Pexels image"
              }`
            : "Select an image to continue."}
        </p>

        <button
          type="button"
          disabled={!selectedImage || loading}
          onClick={() =>
            onConfirm(selectedImage)
          }
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Saving..."
            : "Confirm Image"}
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-600">
        Images provided by Pexels. Photographer
        information is shown for attribution.
      </p>
    </div>
  );
}

export default ProductImageSelector;