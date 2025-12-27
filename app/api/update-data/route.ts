import { NextResponse } from 'next/server';
import { updateAllIndices, updateIndexData } from '@/lib/data-updater';
import { INDICES } from '@/lib/constants';

// POST: Update specific indices or all indices
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indices, updateAll } = body;

    if (updateAll) {
      // Update all indices
      console.log('🔄 Updating all indices...');
      const results = await updateAllIndices(INDICES);
      
      const summary = Array.from(results.entries()).map(([name, result]) => ({
        index: name,
        updated: result.updated,
        recordsAdded: result.recordsAdded
      }));
      
      return NextResponse.json({
        success: true,
        message: 'All indices updated',
        results: summary
      });
    } else if (indices && Array.isArray(indices)) {
      // Update specific indices
      console.log(`🔄 Updating ${indices.length} specific indices...`);
      const results = await updateAllIndices(indices);
      
      const summary = Array.from(results.entries()).map(([name, result]) => ({
        index: name,
        updated: result.updated,
        recordsAdded: result.recordsAdded
      }));
      
      return NextResponse.json({
        success: true,
        message: `${indices.length} indices updated`,
        results: summary
      });
    } else {
      return NextResponse.json({ 
        error: 'Either "indices" array or "updateAll: true" is required' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Update API Error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

// GET: Update a single index (from query params)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexName = searchParams.get('index');

    if (!indexName) {
      return NextResponse.json({ 
        error: 'Index name query parameter is required. Example: /api/update-data?index=NIFTY 50' 
      }, { status: 400 });
    }

    console.log(`🔄 Updating ${indexName}...`);
    const result = await updateIndexData(indexName);
    
    return NextResponse.json({
      success: true,
      index: indexName,
      updated: result.updated,
      recordsAdded: result.recordsAdded,
      message: result.updated 
        ? `Added ${result.recordsAdded} new records` 
        : 'Already up to date'
    });
  } catch (error: any) {
    console.error('Update API Error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

