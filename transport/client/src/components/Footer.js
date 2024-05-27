export const Footer = () => {
    return (
        <footer className="bg-primary shadow-md">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a href="#" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                        <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">ONTEN</span>
                    </a>
                    <ul className="flex flex-wrap items-center mb-6 text-sm">
                        <li>
                            <a href="#" className='secondary'>About</a>
                        </li>
                        <li>
                            <a href="#" className='secondary'>Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className='secondary'>Licensing</a>
                        </li>
                        <li>
                            <a href="#" className='secondary'>Contact</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2023 <a href="#" className="secondary">ONTEN</a>. All Rights Reserved.</span>
            </div>
        </footer>
    );
}