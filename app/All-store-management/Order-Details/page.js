"use client";

import Image from "next/image";

export default function Page() {
  const order = {
    id: "20260408-07391540",
    customer: "Arathy Vipin",
    phone: "+919645378482",
    status: "Pending",
    date: "08-04-2026 07:39 AM",
    paymentMethod: "Cash on Delivery",
    total: 90.9,
    tax: 0,
    shipping: 0,
    coupon: 0,
    items: [
      {
        id: 1,
        name: "LIVOGEN CAPTAB",
        sku: "",
        image: "https://via.placeholder.com/60",
        qty: 1,
        price: 90.9,
        deliveryType: "-",
      },
    ],
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-sm border-0 rounded-4">

        {/* Header */}
        <div className="card-header bg-white py-3">
          <h4 className="mb-0 fw-bold">Order Details</h4>
        </div>

        <div className="card-body">

          {/* Top */}
          <div className="row">

            {/* Customer */}
            <div className="col-lg-6">

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Order"
                width={110}
                height={110}
                alt=""
              />

              <h5 className="fw-bold mt-3">
                {order.customer}
              </h5>

              <p className="text-muted">
                {order.phone}
              </p>

            </div>

            {/* Order Info */}
            <div className="col-lg-6 d-flex justify-content-lg-end mt-4 mt-lg-0">

              <table className="table table-borderless w-auto">

                <tbody>

                  <tr>
                    <th>Order #</th>
                    <td className="text-primary">
                      {order.id}
                    </td>
                  </tr>

                  <tr>
                    <th>Status</th>
                    <td>
                      <span className="badge bg-warning text-dark rounded-pill px-3">
                        {order.status}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <th>Date</th>
                    <td>{order.date}</td>
                  </tr>

                  <tr>
                    <th>Total</th>
                    <td>
                      ₹{order.total.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <th>Payment</th>
                    <td>{order.paymentMethod}</td>
                  </tr>

                  <tr>
                    <th>Additional</th>
                    <td>-</td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          <hr className="my-4" />

          {/* Product Table */}

          <div className="table-responsive">

            <table className="table align-middle">

              <thead className="table-light">

                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Description</th>
                  <th>Delivery Type</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>

              </thead>

              <tbody>

                {order.items.map((item) => (

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>
                      <img
                        src={item.image}
                        width={60}
                        height={60}
                        className="rounded border"
                        alt=""
                      />
                    </td>

                    <td>

                      <div className="fw-semibold">
                        {item.name}
                      </div>

                      <small className="text-muted">
                        SKU : {item.sku || "-"}
                      </small>

                    </td>

                    <td>{item.deliveryType}</td>

                    <td className="text-center">
                      {item.qty}
                    </td>

                    <td className="text-end">
                      ₹{item.price.toFixed(2)}
                    </td>

                    <td className="text-end">
                      ₹{(item.qty * item.price).toFixed(2)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Summary */}

          <div className="row justify-content-end mt-4">

            <div className="col-lg-3">

              <table className="table">

                <tbody>

                  <tr>
                    <th>Sub Total :</th>
                    <td className="text-end">
                      ₹{order.total.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <th>Tax :</th>
                    <td className="text-end">
                      ₹{order.tax.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <th>Shipping :</th>
                    <td className="text-end">
                      ₹{order.shipping.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <th>Coupon :</th>
                    <td className="text-end">
                      ₹{order.coupon.toFixed(2)}
                    </td>
                  </tr>

                  <tr className="table-light">

                    <th className="fs-5">
                      Total :
                    </th>

                    <th className="text-end fs-3 text-primary">
                      ₹{order.total.toFixed(2)}
                    </th>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          {/* Print */}

          <div className="text-end mt-3">

            <button
              className="btn btn-light shadow-sm rounded-circle"
              style={{
                width: 55,
                height: 55,
              }}
              onClick={() => window.print()}
            >
              <i className="bi bi-printer fs-4"></i>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}