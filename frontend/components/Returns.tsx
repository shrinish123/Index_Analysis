"use client";

import { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import PlotWrapper from './Plot';
import { INDICES } from '@/lib/constants';
import { DivergenceData } from '@/lib/types';

export default function Returns() {
  const [benchmark, setBenchmark] = useState('NIFTY 50');
  const [index, setIndex] = useState('NIFTY NEXT 50');
  const [data, setData] = useState<Record<number, DivergenceData[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/returns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ indexName: index, benchmarkName: benchmark }),
        });
        const result = await response.json();
        if (result && !result.error) {
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
  }, [benchmark, index]);

  const renderGraph = (year: number) => {
    const yearData = data[year] || [];
    if (yearData.length === 0) return null;

    const dates = yearData.map(d => d.date);
    const divergence = yearData.map(d => d.divergence);
    const mean = yearData[0].mean;
    const std = yearData[0].std;
    
    return (
      <PlotWrapper
        data={[
          {
            x: dates,
            y: divergence,
            type: 'scatter',
            mode: 'lines',
            name: 'Data',
          },
        ]}
        layout={{
          title: `${index} - ${benchmark} (${year} year Returns)`,
          xaxis: { title: 'Years' },
          yaxis: { title: 'Return Divergence', tickformat: '%' },
          shapes: [
            { type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: mean, y1: mean, line: { color: 'black' } },
            { type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: mean + std, y1: mean + std, line: { color: 'orange', dash: 'dash' } },
            { type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: mean - std, y1: mean - std, line: { color: 'orange', dash: 'dash' } },
            { type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: mean + 2*std, y1: mean + 2*std, line: { color: 'red', dash: 'dash' } },
            { type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: mean - 2*std, y1: mean - 2*std, line: { color: 'red', dash: 'dash' } },
          ],
          autosize: true,
          height: 400,
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  return (
    <div>
      <Row className="mt-4">
        <Col md={{ span: 4, offset: 1 }}>
          <Form.Group>
            <Form.Label>Select Benchmark</Form.Label>
            <Form.Select value={benchmark} onChange={(e) => setBenchmark(e.target.value)}>
              {INDICES.map(i => <option key={i} value={i}>{i}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={{ span: 4, offset: 1 }}>
          <Form.Group>
            <Form.Label>Select Index</Form.Label>
            <Form.Select value={index} onChange={(e) => setIndex(e.target.value)}>
              {INDICES.map(i => <option key={i} value={i}>{i}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {loading ? <p className="text-center mt-5">Loading...</p> : (
        <>
          <Row className="mt-4"><Col md={{ span: 11, offset: 1 }}>{renderGraph(1)}</Col></Row>
          <Row className="mt-4"><Col md={{ span: 11, offset: 1 }}>{renderGraph(3)}</Col></Row>
          <Row className="mt-4"><Col md={{ span: 11, offset: 1 }}>{renderGraph(5)}</Col></Row>
        </>
      )}
    </div>
  );
}
