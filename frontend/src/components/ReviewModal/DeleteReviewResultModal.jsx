import React from 'react';
import { useModal } from '../../context/Modal';

export default function DeleteReviewResultModal({
  message = 'Review successfully deleted',
  autoCloseMs = 1500
}) {
  const { closeModal } = useModal();

  React.useEffect(() => {
    const t = setTimeout(closeModal, autoCloseMs);
    return () => clearTimeout(t);
  }, [autoCloseMs, closeModal]);

  return (
    <div className="delete-result-modal">
      <h3>{message}</h3>
    </div>
  );
}