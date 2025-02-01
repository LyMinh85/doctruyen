"use client";
export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gray-100"></div>
      <div className="subtle-grid"></div>
      <style jsx>{`
        {/* @keyframes subtleMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        } */}
        .subtle-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 2px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 2px, transparent 1px);
          background-size: 50px 50px;
          animation: subtleMove 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
