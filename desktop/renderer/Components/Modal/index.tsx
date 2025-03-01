import React from 'react';
import styles from './Modal.module.css'; // Custom styles for the modal

const Modal = ({ show, onClose, children, title }: any) => {
    if (!show) return null; // Don't render anything if `show` is false

    return (
        <div className={styles['modal-overlay']}>
        <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>{title}</h3>
                <button className={styles['close-button']} onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className={styles['modal-body']}>{children}</div>
            <div className={styles['modal-footer']}>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    </div>
    );
};



export default Modal;
