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
        <motion.div
          className="fixed inset-0 z-[9999] flex"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          />

          {/* Side Drawer */}
          <motion.nav
            className="relative ml-auto h-full w-3/4 max-w-xs bg-white dark:bg-gray-900 p-4 flex flex-col shadow-lg"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}