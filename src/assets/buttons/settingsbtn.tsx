import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const SettingsBtn: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <StyledWrapper>
      <button className="btn" onClick={onClick}>
        <span>{text}</span>
        <div className="container">
          <svg
            height={20}
            width={20}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 1024 1024"
            className="icon"
          >
            <path
              fill="black"
              d="M123.52064 667.99143l344.526782 229.708899 0-205.136409-190.802457-127.396658zM88.051421 585.717469l110.283674-73.717469-110.283674-73.717469 0 147.434938zM556.025711 897.627196l344.526782-229.708899-153.724325-102.824168-190.802457 127.396658 0 205.136409zM512 615.994287l155.406371-103.994287-155.406371-103.994287-155.406371 103.994287zM277.171833 458.832738l190.802457-127.396658 0-205.136409-344.526782 229.708899zM825.664905 512l110.283674 73.717469 0-147.434938zM746.828167 458.832738l153.724325-102.824168-344.526782-229.708899 0 205.136409zM1023.926868 356.00857l0 311.98286q0 23.402371-19.453221 36.566205l-467.901157 311.98286q-11.993715 7.459506-24.57249 7.459506t-24.57249-7.459506l-467.901157-311.98286q-19.453221-13.163834-19.453221-36.566205l0-311.98286q0-23.402371 19.453221-36.566205l467.901157-311.98286q11.993715-7.459506 24.57249-7.459506t24.57249 7.459506l467.901157 311.98286q19.453221 13.163834 19.453221 36.566205z"
            />
          </svg>
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .btn {
    position: relative;
    display: flex;
    overflow: hidden;
    cursor: pointer;
    width: 50px;
    height: 30px;
    background-color: #eeeeed;
    border-radius: 10px;
    border: none;
    padding: 0 10px; /* Reduced padding for smaller button */
    transition: all 0.2s ease;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .btn:hover {
    transform: scale(1.1);
  }

  .btn span {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99;
    width: 100%; /* Span takes full button width */
    height: 100%; /* Span takes full button height */
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    font-size: 12px; /* Smaller font size to fit button */
    text-align: center;
    line-height: 30px; /* Match button height for vertical centering */
    letter-spacing: 1px; /* Reduced for better fit */
    color: #eeeeed;
    background-color: #1f1f1f;
    padding: 0 5px; /* Minimal padding */
    box-sizing: border-box;
    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden; /* Hide overflow text */
    text-overflow: ellipsis; /* Add ellipsis for long text */
    transition: all 1s ease;
  }

  .btn .container {
    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 10px; /* Match button border-radius */
    justify-content: center;
    align-items: center;
  }

  .btn svg {
    padding: 0 5px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .btn .container svg:nth-of-type(1) {
    transition-delay: 0.1s;
  }

  .btn:hover span {
    opacity: 0;
  }

  .btn:hover svg {
    opacity: 1;
  }
`;

export default SettingsBtn;