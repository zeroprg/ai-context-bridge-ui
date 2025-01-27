// DemoForm.js
export const DemoForm = () => (
    <section className="demo-form" id="demo">
      <h2>Request a Demo</h2>
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        {/* Other form fields */}
        <button type="submit">Submit</button>
      </form>
    </section>
  );  

  // Features.js
export const Features = () => (
    <section className="features" id="features">
      <div className="feature">
        <h3>Rapid API Integration</h3>
        <p>Streamline the integration process for efficient API management.</p>
      </div>
      {/* Repeat for each feature */}
    </section>
  );
  
  // Header.js
export const Header = () => (
    <header className="header">
      <div className="logo">API Management</div>
      <nav>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#demo">Demo</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
  

  // Hero.js
export const Hero = () => (
    <section className="hero">
      <h1>Empower Your Business with Advanced API Integration</h1>
      <p>Seamlessly connect and manage your APIs for enhanced efficiency and performance.</p>
      <button>Request a Demo</button>
    </section>
  );
  

  // LLMAPISection.js
export const LLMAPISection = () => (
    <section className="llm-api">
      <h2>LLM API: Advanced Solutions at Your Fingertips</h2>
      <p>Explore the capabilities of our LLM API and how it can transform your digital solutions.</p>
      {/* Additional content */}
    </section>
  );
  
  // Pricing.js
export const Pricing = () => (
    <section className="pricing" id="pricing">
      <h2>Pricing Plans</h2>
      <div className="plan">
        <h3>Basic</h3>
        <p>Essential features for small teams.</p>
        {/* Pricing details */}
      </div>
      {/* Repeat for other plans */}
    </section>
  );
 
 // Footer.js
export const Footer = () => (
    <footer className="footer">
      <p>© 2024 API Bloberry Consulting</p>
      {/* Additional footer content */}
    </footer>
  );
   