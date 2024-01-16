// SandingBox.tsx is a component that is used to display a loading box when the user is sanding the image.
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './SandingBox.css';

const SandingBox = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => (
  <>
    <div className="overlay"></div>

      <AiOutlineLoading3Quarters className="loading-box message-icon loading "  style={{ left: mousePosition.x, top: mousePosition.y}} />
    
  </>
);

export default SandingBox;
