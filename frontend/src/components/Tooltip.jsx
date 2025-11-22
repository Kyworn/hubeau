import React, { useState } from 'react';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute z-10 w-64 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm -top-2 left-full ml-2 dark:bg-gray-700">
                    {text}
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
