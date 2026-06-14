import Image from "next/image";
import React from "react";

export default function GridShape() {
  return (
    <>
      {/* Top-right grid */}
      <div className="position-absolute top-0 end-0 w-100 max-w-250 xl-max-w-450" style={{ zIndex: -1 }}>
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt="grid"
          className="w-100 h-auto"
        />
      </div>

      {/* Bottom-left grid (rotated) */}
      <div className="position-absolute bottom-0 start-0 w-100 max-w-250 xl-max-w-450 rotate-180" style={{ zIndex: -1 }}>
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt="grid"
          className="w-100 h-auto"
        />
      </div>

      {/* Custom CSS for responsive max-width and rotation */}
      <style jsx>{`
        .max-w-250 {
          max-width: 250px;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        @media (min-width: 1200px) {
          .xl-max-w-450 {
            max-width: 450px !important;
          }
        }
        /* Ensure images don't overflow */
        .w-100 {
          width: 100%;
        }
        .h-auto {
          height: auto;
        }
      `}</style>
    </>
  );
}