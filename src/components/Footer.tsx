const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#f2f2f2', textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <p style={{ margin: 0, color: '#333' }}>
        &copy; {currentYear} All Rights Reserved.
      </p>
      <p style={{ margin: 0, color: '#333' }}>
        Powered by <a href="https://bloberryconsulting.com" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>Bloberry Consulting</a>
      </p>
    </footer>
  );
};

export default Footer;
