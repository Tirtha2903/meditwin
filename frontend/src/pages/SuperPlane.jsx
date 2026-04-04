import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase/client'
import * as d3 from 'd3'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const SUPERPLANE_WEBHOOK = 'https://app.superplane.com/api/v1/webhooks/YOUR_WEBHOOK_ID'

export default function SuperPlane({ user }) {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const clusterRef = useRef(null)
  const heatmapRef = useRef(null)

  useEffect(() => {
    const fetchScans = async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      setScans(data || [])
      setLoading(false)
    }
    fetchScans()
  }, [user.id])

  useEffect(() => {
    if (!loading && scans.length > 0) {
      drawClusterMap()
      drawHeatmap()
    }
  }, [loading, scans])

  const drawClusterMap = () => {
    const el = clusterRef.current
    if (!el) return
    d3.select(el).selectAll('*').remove()

    const width = el.offsetWidth || 500
    const height = 300
    const svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // Scale age and heart_rate to x/y
    const xScale = d3.scaleLinear()
      .domain([d3.min(scans, d => d.age) - 5, d3.max(scans, d => d.age) + 5])
      .range([40, width - 20])

    const yScale = d3.scaleLinear()
      .domain([d3.min(scans, d => d.heart_rate) - 5, d3.max(scans, d => d.heart_rate) + 5])
      .range([height - 30, 20])

    // Grid lines
    svg.append('g')
      .attr('transform', `translate(0,${height - 30})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}yr`))
      .selectAll('text').style('fill', '#5a7a90').style('font-size', '10px')

    svg.append('g')
      .attr('transform', 'translate(40,0)')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}bpm`))
      .selectAll('text').style('fill', '#5a7a90').style('font-size', '10px')

    // Style axes
    svg.selectAll('.domain').style('stroke', '#1a3a52')
    svg.selectAll('.tick line').style('stroke', '#1a3a52')

    // Cluster zones
    svg.append('rect')
      .attr('x', 40).attr('y', 20)
      .attr('width', width - 60).attr('height', height - 50)
      .attr('fill', 'rgba(0,245,160,0.03)')
      .attr('stroke', '#1a3a52')
      .attr('rx', 8)

    // Draw dots
    svg.selectAll('circle')
      .data(scans)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.age))
      .attr('cy', d => yScale(d.heart_rate))
      .attr('r', 8)
      .attr('fill', d => d.risk_label === 'HIGH' ? 'rgba(255,77,109,0.8)' : 'rgba(0,245,160,0.8)')
      .attr('stroke', d => d.risk_label === 'HIGH' ? '#ff4d6d' : '#00f5a0')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // Labels on hover
    svg.selectAll('circle')
      .append('title')
      .text(d => `Age: ${d.age}, HR: ${d.heart_rate}, Risk: ${d.risk_label}`)

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width - 120}, 30)`)
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 6).attr('fill', 'rgba(255,77,109,0.8)')
    legend.append('text').attr('x', 12).attr('y', 4).text('High Risk').style('fill', '#5a7a90').style('font-size', '10px')
    legend.append('circle').attr('cx', 0).attr('cy', 20).attr('r', 6).attr('fill', 'rgba(0,245,160,0.8)')
    legend.append('text').attr('x', 12).attr('y', 24).text('Low Risk').style('fill', '#5a7a90').style('font-size', '10px')
  }

  const drawHeatmap = () => {
    const el = heatmapRef.current
    if (!el) return
    d3.select(el).selectAll('*').remove()

    const width = el.offsetWidth || 500
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Age buckets and HR buckets
    const ageBuckets = ['18-30', '31-45', '46-60', '61+']
    const hrBuckets = ['<60', '60-80', '81-100', '>100']

    // Count scans per bucket
    const grid = ageBuckets.map(ab => hrBuckets.map(hb => {
      const count = scans.filter(s => {
        const ageMatch =
          (ab === '18-30' && s.age >= 18 && s.age <= 30) ||
          (ab === '31-45' && s.age >= 31 && s.age <= 45) ||
          (ab === '46-60' && s.age >= 46 && s.age <= 60) ||
          (ab === '61+' && s.age >= 61)
        const hrMatch =
          (hb === '<60' && s.heart_rate < 60) ||
          (hb === '60-80' && s.heart_rate >= 60 && s.heart_rate <= 80) ||
          (hb === '81-100' && s.heart_rate >= 81 && s.heart_rate <= 100) ||
          (hb === '>100' && s.heart_rate > 100)
        return ageMatch && hrMatch
      }).length
      const highCount = scans.filter(s => {
        const ageMatch =
          (ab === '18-30' && s.age >= 18 && s.age <= 30) ||
          (ab === '31-45' && s.age >= 31 && s.age <= 45) ||
          (ab === '46-60' && s.age >= 46 && s.age <= 60) ||
          (ab === '61+' && s.age >= 61)
        const hrMatch =
          (hb === '<60' && s.heart_rate < 60) ||
          (hb === '60-80' && s.heart_rate >= 60 && s.heart_rate <= 80) ||
          (hb === '81-100' && s.heart_rate >= 81 && s.heart_rate <= 100) ||
          (hb === '>100' && s.heart_rate > 100)
        return ageMatch && hrMatch && s.risk_label === 'HIGH'
      }).length
      return { ab, hb, count, highCount, riskRatio: count > 0 ? highCount / count : 0 }
    }))

    const xScale = d3.scaleBand().domain(hrBuckets).range([0, innerW]).padding(0.05)
    const yScale = d3.scaleBand().domain(ageBuckets).range([0, innerH]).padding(0.05)
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateRgb('#0a1520', '#ff4d6d'))

    svg.append('g').attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text').style('fill', '#5a7a90').style('font-size', '10px')

    svg.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text').style('fill', '#5a7a90').style('font-size', '10px')

    svg.selectAll('.domain').style('stroke', '#1a3a52')
    svg.selectAll('.tick line').style('stroke', '#1a3a52')

    grid.forEach(row => {
      row.forEach(cell => {
        svg.append('rect')
          .attr('x', xScale(cell.hb))
          .attr('y', yScale(cell.ab))
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('fill', colorScale(cell.riskRatio))
          .attr('rx', 4)
          .attr('stroke', '#1a3a52')
          .attr('stroke-width', 1)

        if (cell.count > 0) {
          svg.append('text')
            .attr('x', xScale(cell.hb) + xScale.bandwidth() / 2)
            .attr('y', yScale(cell.ab) + yScale.bandwidth() / 2 + 4)
            .attr('text-anchor', 'middle')
            .style('fill', '#d0e8f5')
            .style('font-size', '11px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text(cell.count)
        }
      })
    })

    // Axis labels
    svg.append('text')
      .attr('x', innerW / 2).attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .style('fill', '#5a7a90').style('font-size', '11px')
      .text('Heart Rate (bpm)')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('fill', '#5a7a90').style('font-size', '11px')
      .text('Age Group')
  }

  // Timeline projection data — extend actual scans into future
  const timelineData = () => {
    if (scans.length === 0) return []
    const actual = scans.map(s => ({
      date: new Date(s.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      risk: s.probability,
      projected: null,
      type: 'actual'
    }))
    const lastRisk = scans[scans.length - 1]?.probability || 50
    const trend = scans.length > 1
      ? (scans[scans.length - 1].probability - scans[0].probability) / scans.length
      : 0
    const projections = [7, 30, 90].map(days => ({
      date: `+${days}d`,
      risk: null,
      projected: Math.min(100, Math.max(0, Math.round(lastRisk + trend * days / 7))),
      type: 'projected'
    }))
    return [...actual, ...projections]
  }

  const triggerSuperPlane = async () => {
    const highRiskScans = scans.filter(s => s.risk_label === 'HIGH')
    try {
      await fetch('http://localhost:5000/api/superplane/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'high_risk_detected',
          patient_id: user.id,
          high_risk_count: highRiskScans.length,
          latest_probability: scans[scans.length - 1]?.probability,
          timestamp: new Date().toISOString()
        })
      })
      alert('SuperPlane event triggered successfully!')
    } catch {
      alert('SuperPlane webhook failed — check backend')
    }
  }

  if (loading) return <div className="loading-state" style={{height:'60vh'}}><div className="spinner"/></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ SuperPlane Dashboard</h1>
          <p className="page-sub">Event-driven DevOps control plane for patient risk workflows</p>
        </div>
        <button className="submit-btn" style={{padding:'12px 24px', width:'auto'}} onClick={triggerSuperPlane}>
          ⚡ Trigger SuperPlane Event
        </button>
      </div>

      {scans.length === 0 ? (
        <div className="placeholder">
          <div className="placeholder-icon">⚡</div>
          <p>Run some scans first to see visualizations</p>
        </div>
      ) : (
        <>
          {/* Cluster Map */}
          <div className="chart-card" style={{marginBottom:24}}>
            <div className="chart-title">Patient Similarity Cluster Map — Age vs Heart Rate</div>
            <div ref={clusterRef} style={{width:'100%'}}/>
          </div>

          {/* Heatmap */}
          <div className="chart-card" style={{marginBottom:24}}>
            <div className="chart-title">Risk Heatmap — Age Group vs Heart Rate Zone</div>
            <div ref={heatmapRef} style={{width:'100%'}}/>
          </div>

          {/* Timeline */}
          <div className="chart-card" style={{marginBottom:24}}>
            <div className="chart-title">Risk Timeline — Actual + 7/30/90 Day Projections</div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timelineData()}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52"/>
                <XAxis dataKey="date" stroke="#5a7a90" tick={{fontSize:11}}/>
                <YAxis stroke="#5a7a90" tick={{fontSize:11}} domain={[0,100]}/>
                <Tooltip contentStyle={{background:'#0a1520',border:'1px solid #1a3a52',borderRadius:'8px'}}/>
                <Area type="monotone" dataKey="risk" stroke="#ff4d6d" fill="url(#actualGrad)" strokeWidth={2} name="Actual Risk %" connectNulls={false}/>
                <Area type="monotone" dataKey="projected" stroke="#ffd700" fill="url(#projGrad)" strokeWidth={2} strokeDasharray="5 5" name="Projected Risk %" connectNulls={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SuperPlane Events Log */}
          <div className="chart-card">
            <div className="chart-title">SuperPlane Event Log</div>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
              {scans.filter(s => s.risk_label === 'HIGH').map(s => (
                <div key={s.id} className="history-item risk-high" style={{padding:'12px 16px'}}>
                  <div className="risk-badge"><span className="risk-dot"/>HIGH RISK EVENT</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:'.75rem', color:'var(--text-dim)'}}>
                    Age: {s.age} · HR: {s.heart_rate} · Risk: {s.probability}% · {new Date(s.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              {scans.filter(s => s.risk_label === 'HIGH').length === 0 && (
                <p style={{color:'var(--text-dim)', fontSize:'.85rem'}}>No high risk events detected yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}