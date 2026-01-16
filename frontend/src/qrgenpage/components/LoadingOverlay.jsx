import React from 'react';

const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;

    let iconClass, bgColor, statusText;

    if (status === 'loading') {
        // Icon na iikot habang nagpo-process
        iconClass = "bi bi-arrow-repeat text-primary animate-spin";
        bgColor = "rgba(0, 0, 0, 0.7)"; 
        statusText = "CHECKING...";
    } else if (status === 'success') {
        // Static checkmark pagkatapos ng loading
        iconClass = "bi bi-check-circle-fill text-success";
        bgColor = "rgba(25, 135, 84, 0.85)"; 
        statusText = "SUCCESS";
    } else if (status === 'error') {
        // Static error icon
        iconClass = "bi bi-x-octagon-fill text-danger";
        bgColor = "rgba(220, 53, 69, 0.85)"; 
        statusText = "FAILED";
    }

    return (
        <div 
            className="position-fixed w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center" 
            style={{ 
                zIndex: 9999, 
                backgroundColor: bgColor,
                backdropFilter: 'blur(8px)', 
                transition: 'background-color 0.4s ease'
            }}
        >
            <div 
                className="bg-white p-5 rounded-4 shadow-lg text-center animate-pop-in" 
                style={{ minWidth: '350px' }}
            >
                <div className="mb-4">
                    {/* Dito lalabas ang icon na iikot o magiging static */}
                    <i className={iconClass} style={{ fontSize: '5rem', display: 'inline-block' }}></i>
                </div>
                
                <h3 className="fw-bold text-dark mb-2" style={{ letterSpacing: '1px' }}>
                    {statusText}
                </h3>
                
                <p className="text-muted mb-0 fw-medium">
                    {message || "Processing request..."}
                </p>
            </div>

            <style jsx>{`
                /* Simple continuous rotation para sa loading icon */
                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Swabeng pag-litaw ng white box */
                .animate-pop-in {
                    animation: popIn 0.3s ease-out;
                }

                @keyframes popIn {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoadingOverlay;