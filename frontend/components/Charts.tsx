"use client";

import { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import PlotWrapper from './Plot';
import { INDICES } from '@/lib/constants';
import { IndexRecord } from '@/lib/types';

export default function Charts() {
  const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');
  const [data, setData] = useState<IndexRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/indices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ indexName: selectedIndex }),
        });
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error('Failed to fetch data', result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedIndex]);

  return (
    <div>
      <Row className="justify-content-center mt-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Index</Form.Label>
            <Form.Select 
              value={selectedIndex} 
              onChange={(e) => setSelectedIndex(e.target.value)}
            >
              {INDICES.map((index) => (
                <option key={index} value={index}>
                  {index}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={{ span: 11, offset: 1 }}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <PlotWrapper
              data={[
                {
                  x: data.map((d) => d.Date),
                  y: data.map((d) => d.Close),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Closing Price',
                },
              ]}
              layout={{
                title: selectedIndex,
                xaxis: { title: 'Years' },
                yaxis: { title: 'Closing Price' },
                autosize: true,
                width: 1000, // Adjust as needed or make responsive
                height: 500,
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
