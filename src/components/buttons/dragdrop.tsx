import React from "react";
import styled from "styled-components";

interface ButtonProps {
	text: string;
	onClick: () => void;
}

const Card: React.FC<ButtonProps> = ({ text, onClick }) => {
	return (
		<CardInner>
			<CardContent>
				<Dropzone>
					<DropzoneContent>
						<DropIconWrapper>
							<Icon viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</Icon>
						</DropIconWrapper>
						<DropText>
							<DropTitle>{text}</DropTitle>
						</DropText>
					</DropzoneContent>
				</Dropzone>

      {/*Parte que vai aparecer os arquivos que o usuario vai anexando (arrumar progressbar) */}

				<FileList>

				{/* <FileItem>
						<FileDetails>
							<FileIconWrapper color="cyan">
								<Icon viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</Icon>
							</FileIconWrapper>

							<FileText>
								<FileName>document.pdf</FileName>
								<FileSize>2.4 MB • PDF</FileSize>
							</FileText>
						</FileDetails>
						<FileStatus>
							<ProgressBar> </ProgressBar>
							<ProgressText>84%</ProgressText>
							<CloseButton aria-label="Remove file">
								<Icon viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</Icon>
							</CloseButton>
						</FileStatus>
					</FileItem> */}
          
				</FileList>

			</CardContent>
		</CardInner>
	);
};

export default Card;

/* ==== Styled Components ==== */

const CardContainer = styled.div`
	position: relative;
	width: 100%;
	max-width: 420px;
	margin: 0 auto;
	padding: 1rem;
`;

const CardInner = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background-color: #13141aff;
  margin-top: 1.5rem;
  padding-left: 10px;
  padding-right: 10px;
  }
`;

const BlurCircleLeft = styled.div`
	position: absolute;
	left: -4rem;
	top: -4rem;
	height: 8rem;
	width: 8rem;
	border-radius: 9999px;
	background: linear-gradient(
		to bottom right,
		rgba(6, 182, 212, 0.125),
		rgba(14, 165, 233, 0)
	);
	filter: blur(1rem);
	transition: all 0.5s ease;
	${CardInner}:hover & {
		transform: scale(1.5);
		opacity: 0.7;
	}
`;

const BlurCircleRight = styled.div`
	position: absolute;
	right: -4rem;
	bottom: -4rem;
	height: 8rem;
	width: 8rem;
	border-radius: 9999px;
	background: linear-gradient(
		to bottom right,
		rgba(14, 165, 233, 0.125),
		rgba(6, 182, 212, 0)
	);
	filter: blur(1rem);
	transition: all 0.5s ease;
	${CardInner}:hover & {
		transform: scale(1.5);
		opacity: 0.7;
	}
`;

const CardContent = styled.div`
	position: relative;
	padding: 1rem;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const TextGroup = styled.div``;

const Title = styled.h3`
	font-weight: 600;
	font-size: clamp(1rem, 2vw, 1.25rem);
	color: #f8fafc;
`;

const Subtitle = styled.p`
	font-size: clamp(0.75rem, 1.5vw, 0.875rem);
	color: #94a3b8;
`;

const IconWrapper = styled.div`
	border-radius: 0.5rem;
	background-color: rgba(6, 182, 212, 0.1);
	padding: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Icon = styled.svg`
	height: 1.5rem;
	width: 1.5rem;
	stroke: currentColor;
	color: #06b6d4;
`;

const Dropzone = styled.div`
	margin-top: 1.rem;
	position: relative;
`;

const DropInput = styled.input`
	position: absolute;
	inset: 0;
	z-index: 50;
	height: 100%;
	width: 100%;
	cursor: pointer;
	opacity: 0;
`;

const DropzoneContent = styled.div`
	border-radius: 1rem;
	border: 2px dashed #475569;
	background-color: rgba(15, 23, 42, 0.75);
	padding: 1rem;
	display: flex;
	gap: 1rem;
	cursor: pointer;
	transition: border-color 0.3s ease;

	&:hover {
		box-shadow: 0 0 0 2.5px #2f303d, 0px 0px 25px -15px #000;

	}
`;

const DropIconWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #0ea5e9;
	border-radius: 0.5rem;
	padding: 0.5rem;
	color: white;
  margin-left: -5px
`;

const DropText = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	color: #bdbecb;
	font-size: 14px;
	letter-spacing: 0.5px;
  margin-left: -12px
`;

const DropTitle = styled.h4`
	font-weight: 600;
	font-size: clamp(0.9rem, 1.5vw, 1rem);
`;

const DropInfo = styled.p`
	font-size: clamp(0.65rem, 1vw, 0.75rem);
`;

const FileList = styled.ul`
  margin-top: 1.5rem;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
d
  /* Scroll se houver muitos arquivos */
  max-height: 250px; /* ajuste como quiser */
  overflow-y: auto;

  /* Scrollbar bonitinha */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #3b82f6 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #3b82f6;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;


const FileItem = styled.li`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
`;

const FileDetails = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
`;

const FileIconWrapper = styled.div<{ color: "cyan" | "emerald" }>`
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${({ color }) =>
		color === "cyan" ? "rgba(6, 182, 212, 0.1)" : "rgba(22, 163, 74, 0.1)"};
	color: ${({ color }) => (color === "cyan" ? "#06b6d4" : "#16a34a")};
	padding: 0.5rem;
	border-radius: 0.5rem;
	flex-shrink: 0;
`;

const FileText = styled.div`
	display: flex;
	flex-direction: column;
`;

const FileName = styled.p`
	font-weight: 600;
	color: #f8fafc;
	font-size: clamp(0.9rem, 1.5vw, 1rem);
`;

const FileSize = styled.p`
	font-size: clamp(0.65rem, 1vw, 0.75rem);
	color: #94a3b8;
`;

const FileStatus = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 0.5rem;
`;

const ProgressText = styled.span`
	font-size: clamp(0.65rem, 1vw, 0.75rem);
	font-weight: 600;
	color: #06b6d4;
`;

const CloseButton = styled.button`
	background: transparent;
	border: none;
	padding: 0;
	cursor: pointer;
	color: #64748b;
	transition: color 0.3s ease;

	&:hover {
		color: #ef4444; /* red on hover */
	}

	display: flex;
	align-items: center;
	justify-content: center;
	height: 1.25rem;
	width: 1.25rem;
`;

const ProgressBar = styled.div`
	height: 0.25rem;
	width: 100%;
	background-color: #475569;
	border-radius: 9999px;
	overflow: hidden;
`;

const Progress = styled.div`
	height: 100%;
	background: linear-gradient(to right, #06b6d4, #0ea5e9);
	border-radius: 9999px;
`;

const CompletedStatus = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 0.25rem;
	color: #16a34a;
	font-weight: 600;

	svg {
		height: 1.25rem;
		width: 1.25rem;
	}
`;

const CompleteText = styled.span`
	font-size: clamp(0.75rem, 1vw, 0.875rem);
`;

/* ===== Media Queries ===== */
const Container = styled.div`
  /* estilos normais */

@media (max-width: 400px) {
  ${CardContainer} {
    padding: 0.5rem;
  }
  ${CardContent} {
    padding: 1rem;
  }
`;
