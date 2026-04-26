export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {/* Línea superior */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[2px] w-25 bg-gray-300" />
          <span className="font-bold text-black text-4xl tracking-wide">
            YA EMPEZÓ
          </span>
          <div className="h-[2px] w-25 bg-gray-300" />
        </div>

        {/* Nombre */}
        <h1
          className="font-extrabold text-red-700 leading-none
          text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
        >
          MarcoPolo
        </h1>
      </div>
    </div>
  );
}
