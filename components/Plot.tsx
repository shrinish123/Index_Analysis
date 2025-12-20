"use client";

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PlotWrapper(props: any) {
  return <Plot {...props} />;
}
