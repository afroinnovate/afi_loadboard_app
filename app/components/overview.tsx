export default function Overview() {
    return (
        <div className="container mx-auto px-4 py-8 sm:w-auto md:w-auto md:h-auto lg:w-auto">
           <div className="lg:flex justify-center items-center shadow-md border-spacing-3 mb-6 sm:max-sm:w-full sm:w-full md:w-full md:h-auto lg:w-auto">
                <h1 className="text-2xl font-bold mb-4 p-6 text-center text-green-500 sm:w-auto md:w-auto lg:w-auto">
                    Dashboard Overview
                </h1>
            </div>
            <p className="sm:w-auto md:w-auto lg:w-auto justify-center">
                Welcome to the Shippers dashboard
            </p>
        </div>
    );
}