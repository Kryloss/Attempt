export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center animate-spin">
                <img src="/favicon.svg" alt="gymNote Logo" className="w-8 h-8" />
            </div>
        </div>
    )
}
