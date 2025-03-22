import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">Геносис</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Главная
                </NavLink>
                <NavLink 
                  to="/orders" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Заказы
                </NavLink>
                <NavLink 
                  to="/calculation" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Расчет
                </NavLink>
                <NavLink 
                  to="/calendar" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Календарь
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  О системе
                </NavLink>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Открыть главное меню</span>
              {/* Иконка меню */}
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Мобильное меню */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive 
                ? "bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Главная
          </NavLink>
          <NavLink 
            to="/orders" 
            className={({ isActive }) => 
              isActive 
                ? "bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Заказы
          </NavLink>
          <NavLink 
            to="/calculation" 
            className={({ isActive }) => 
              isActive 
                ? "bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Расчет
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => 
              isActive 
                ? "bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Календарь
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              isActive 
                ? "bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            О системе
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;