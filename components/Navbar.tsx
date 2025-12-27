"use client";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Link from 'next/link';

export default function AppNavbar() {
  return (
    <Navbar expand="lg" className="shadow-sm border-bottom" style={{ backgroundColor: '#1A1A1A', minHeight: '80px', padding: '1rem 2rem' }} variant="dark">
      <Container fluid>
        <Navbar.Brand as={Link} href="/" className="fw-bold" style={{ 
          color: 'rgb(255, 255, 255)', 
          fontSize: '20px', 
          lineHeight: '30px',
          fontFamily: '"Nunito Sans", -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          letterSpacing: '2px'
        }}>PRAVIA</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} href="/" style={{ color: '#d3d3d3', fontWeight: 200, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '20px' }}>Charts</Nav.Link>
            <Nav.Link as={Link} href="/returns" style={{ color: '#d3d3d3', fontWeight: 200, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '20px' }}>Returns</Nav.Link>
            <Nav.Link as={Link} href="/dashboard" style={{ color: '#d3d3d3', fontWeight: 200, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '20px' }}>Dashboard</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
