function RecentProducts({ products = [] }) {
  return (
    <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Recent Products
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Latest products added to the inventory
          </p>
        </div>

        <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
          {products.length} Products
        </span>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden">
        <table>
          <thead className="bg-slate-800/50">
            <tr className="text-left text-sm uppercase tracking-wider text-slate-400">
              <th className="w-[45%] px-6 py-4">
                Product
              </th>

              <th className="w-[20%] px-6 py-4">
                Category
              </th>

              <th className="w-[15%] px-6 py-4">
                Price
              </th>

              <th className="w-[20%] px-6 py-4">
                Created By
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-slate-800 transition hover:bg-slate-800/40"
              >
                {/* Product */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">

                    <img
                      src={
                        product.image
                          ? `http://localhost:5000/uploads/${product.image}`
                          : ""
                      }
                      alt={product.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />

                    <div>
                      <h3 className="max-w-xs truncate font-semibold text-white">
                        {product.name}
                      </h3>

                      <p className="text-sm text-slate-400">
                        ID: {product.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-5">
                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-6 py-5">
                  <span className="font-bold text-emerald-400">
                    ${product.price}
                  </span>
                </td>

                {/* Created By */}
                <td className="px-6 py-5">
                  <div>
                    <p className="font-medium text-white">
                      {product.creatorName || "Unknown"}
                    </p>

                    <p className="text-sm text-slate-400">
                      {product.creatorRole || ""}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentProducts;