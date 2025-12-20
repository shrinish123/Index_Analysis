"use client";

import { useState, useEffect } from 'react';
import { Table, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { BROAD_INDICES, SECTOR_INDICES, THEME_INDICES, SMART_BETA_INDICES } from '@/lib/index-categories';

interface DashboardRow {
  comparison: string;
  year1: number;
  year3: number;
  year5: number;
}

export default function DashboardTable() {
  const [key, setKey] = useState('broad');
  const [data, setData] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setData([]); // Clear data to avoid stale state
      let indices: string[] = [];
      let isBroad = false;

      console.log('Fetching data for key:', key);

      switch (key) {
        case 'broad':
          indices = BROAD_INDICES;
          isBroad = true;
          break;
        case 'sector':
          indices = SECTOR_INDICES;
          break;
        case 'theme':
          indices = THEME_INDICES;
          break;
        case 'smartBeta':
          indices = SMART_BETA_INDICES;
          break;
        default:
          console.error('Unknown key:', key);
          setLoading(false);
          return;
      }

      console.log('Indices:', indices);

      try {
        const response = await fetch('/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ indices, isBroad }),
          cache: 'no-store' // Ensure no caching
        });
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
            console.error('Failed to fetch dashboard data', result);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [key]);

  const getStyle = (val: number) => {
    if (isNaN(val)) return {};
    if (val >= 1.5) return { backgroundColor: 'green', color: 'white' };
    if (val < -1.5) return { backgroundColor: 'red', color: 'white' };
    return {};
  };

  return (
    <div>
      <h2 style={{ 
        margin: '2rem',
        fontFamily: '"Nunito Sans", -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 600,
        color: 'rgb(26, 26, 26)',
        fontSize: '25px',
        lineHeight: '30px',
        letterSpacing: '1.5px'
      }}>DASHBOARD</h2>
      <Tabs
        id="dashboard-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k || 'broad')}
        className="mb-3"
      >
        <Tab eventKey="broad" title="Broad Indices" />
        <Tab eventKey="sector" title="Sectorial Indices" />
        <Tab eventKey="theme" title="Thematic Indices" />
        <Tab eventKey="smartBeta" title="SmartBeta Indices" />
      </Tabs>

      {loading ? <p>Loading...</p> : (
        <Row>
          <Col md={{ span: 11, offset: 1 }}>
            <Table striped bordered hover responsive className="text-center" style={{ 
              fontSize: '16px', 
              fontFamily: '"Nunito Sans"', 
              fontWeight: 200, 
              color: 'rgb(85, 89, 92)' 
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '15px', textTransform: 'uppercase', fontWeight: 'normal' }}>comparable</th>
                  <th style={{ padding: '15px', textTransform: 'uppercase', fontWeight: 'normal' }}>1 year</th>
                  <th style={{ padding: '15px', textTransform: 'uppercase', fontWeight: 'normal' }}>3 Year</th>
                  <th style={{ padding: '15px', textTransform: 'uppercase', fontWeight: 'normal' }}>5 year</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '15px' }}>{row.comparison}</td>
                    <td style={{ ...getStyle(row.year1), padding: '15px' }}>{(row.year1 === null || isNaN(row.year1)) ? 'N/A' : row.year1.toFixed(4)}</td>
                    <td style={{ ...getStyle(row.year3), padding: '15px' }}>{(row.year3 === null || isNaN(row.year3)) ? 'N/A' : row.year3.toFixed(4)}</td>
                    <td style={{ ...getStyle(row.year5), padding: '15px' }}>{(row.year5 === null || isNaN(row.year5)) ? 'N/A' : row.year5.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
    </div>
  );
}
