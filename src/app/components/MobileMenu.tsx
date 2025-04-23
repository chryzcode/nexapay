"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface NavLink { id: string; href: string; label: string }
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  user: any;
  onLogout: () => Promise<void>;
}

export default function MobileMenu({ isOpen, onClose, links, user, onLogout }: MobileMenuProps) {
  const router = useRouter();
  const navigate = async (href: string) => {
    onClose();
    await router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Removed overlay for no blur/dark effect */}

          {/* Side Drawer - now animates from top to bottom, positioned right and lower */}
          <motion.nav
            className="fixed right-0 mt-5 w-[90vw] max-w-xs bg-white dark:bg-gray-900 p-4 flex flex-col shadow-lg rounded-b-xl z-[10000]"
            initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ type: 'tween', duration: 0.3 }}
          >
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => navigate(link.href)}
                className="py-2 px-3 text-left w-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {link.label}
              </button>
            ))}

            {/* Add Settings if authenticated */}
            {user && (
              <button
                onClick={() => navigate('/settings')}
                className="py-2 px-3 text-left w-full transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Settings
              </button>
            )}

            {user ? (
              <button
                onClick={async () => { onClose(); await onLogout(); }}
                className="py-2 px-3 text-left w-full text-red-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="py-2 px-3 text-left w-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </button>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}