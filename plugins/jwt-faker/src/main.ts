/**
 * JWT Faker Plugin
 *
 * Enables generating, customizing, signing, decoding, and copying JSON Web Tokens (JWTs) for API authentication testing.
 */

import type { PluginContext } from '@voiden/sdk/ui';
import React from 'react';
import { JwtFakerModal } from './components/JwtFakerModal';

const jwtFakerPlugin = (context: PluginContext) => {
  const showToast = (context as any)?.ui?.showToast as
    | ((message: string, type?: 'info' | 'success' | 'warning' | 'error') => void)
    | undefined;

  let modalRoot: HTMLElement | null = null;
  let isModalOpen = false;

  const renderModal = () => {
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'jwt-faker-modal-root';
      document.body.appendChild(modalRoot);
    }

    const { createRoot } = (window as any).__voiden_shims__?.['react-dom/client'] || {};
    if (createRoot) {
      if (!(modalRoot as any)._reactRoot) {
        (modalRoot as any)._reactRoot = createRoot(modalRoot);
      }
      (modalRoot as any)._reactRoot.render(
        React.createElement(JwtFakerModal, {
          isOpen: isModalOpen,
          onClose: () => {
            isModalOpen = false;
            renderModal();
          },
          showToast,
        })
      );
    }
  };

  return {
    onload: () => {
      // Expose global helper to open modal
      (window as any).__voidenOpenJwtFaker__ = () => {
        isModalOpen = true;
        renderModal();
      };

      // Register status bar item
      if (typeof context.registerStatusBarItem === 'function') {
        context.registerStatusBarItem({
          id: 'jwt-faker-status-item',
          text: 'JWT Faker',
          icon: 'Sparkles',
          tooltip: 'Generate and decode JWT tokens for testing',
          onClick: () => {
            isModalOpen = true;
            renderModal();
          },
        });
      }
    },

    onunload: () => {
      delete (window as any).__voidenOpenJwtFaker__;
      if (modalRoot) {
        if ((modalRoot as any)._reactRoot) {
          (modalRoot as any)._reactRoot.unmount();
        }
        modalRoot.remove();
        modalRoot = null;
      }
    },
  };
};

export default jwtFakerPlugin;
