import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

export default function TwinTimeline({ result, form }) {
  const current = result.prediction.probability
  const score = result.digital_twin.health_score
  const isHigh = result.prediction.risk_label === 'HIGH'

  // Project future risk based on current factors
  const smokingPenalty = Number(form.smoking) * 5
  const diabetesPenalty = Number(form.diabetes) * 4
  const trend = isHigh ? 2.5 : -1.5

  const project = (days) => {
    const raw = current + (trend * days / 7) + (smokingPenalty * days / 90) + (diabetesPenalty * days / 90)
    return Math.min(99, Math.max(1, Math.round(raw)))
  }

  const projectScore = (days) => {
    const raw = score + (isHigh ? -days/10 : days/15)
    return Math.min(100, Math.max(0, Math.round(raw)))
  }

  const data = [
    { label: 'Now', days: 0, risk: current, health: score, type: 'present' },
    { label: '7 days', days: 7, risk: project(7), health: projectScore(7), type: 'future' },
    { label: '30 days', days: 30, risk: project(30), health: projectScore(30), type: 'future' },
    { label: '90 days', days: 90, risk: project(90), health: projectScore(90), type: 'future' },
  ]

  const improvements = [
    Number(form.smoking) === 1 && 'Quit smoking → −8% risk in 30 days',
    Number(form.bmi) > 25 && 'Reduce BMI by 2 points → −5% risk',
    Number(form.systolic_bp) > 130 && 'Lower BP to normal → −10% risk in 90 days',
    Number(form.cholesterol) > 200 && 'Reduce cholesterol → −6% risk',
    Number(form.glucose) > 100 && 'Control blood sugar → −4% risk',
  ].filter(Boolean)

  return (
    <div className="panel" style={{marginTop:24}}>
      <h2 className="panel-title">
        <span className="step-num">04</span> Digital Twin Simulation — Present vs Future
      </h2>

      <div className="twin-timeline-nodes">
        {data.map((d, i) => (
          <div key={i} className={`timeline-node ${d.type}`}>
            <div className="timeline-node-label">{d.label}</div>
            <div className="timeline-node-circle" style={{
              borderColor: d.type === 'present' ? 'var(--teal)' : d.risk > 60 ? 'var(--red)' : 'var(--teal)',
              background: d.type === 'present' ? 'rgba(0,245,160,.1)' : 'var(--surface-2)'
            }}>
              <span className="timeline-node-risk" style={{
                color: d.risk > 60 ? 'var(--red)' : 'var(--teal)'
              }}>{d.risk}%</span>
              <span className="timeline-node-sub">risk</span>
            </div>
            <div className="timeline-node-score">Score: {d.health}</div>
            {i < data.length - 1 && <div className="timeline-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="chart-card" style={{marginTop:20, marginBottom:20}}>
        <div className="chart-title">Risk Trajectory Simulation</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="riskGradTl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="healthGradTl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00f5a0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52"/>
            <XAxis dataKey="label" stroke="#5a7a90" tick={{fontSize:11}}/>
            <YAxis stroke="#5a7a90" tick={{fontSize:11}} domain={[0,100]}/>
            <Tooltip contentStyle={{background:'#0a1520',border:'1px solid #1a3a52',borderRadius:'8px'}}/>
            <ReferenceLine y={50} stroke="#ffd700" strokeDasharray="4 4" label={{value:'Risk threshold',fill:'#ffd700',fontSize:10}}/>
            <Area type="monotone" dataKey="risk" stroke="#ff4d6d" fill="url(#riskGradTl)" strokeWidth={2} name="Risk %"/>
            <Area type="monotone" dataKey="health" stroke="#00f5a0" fill="url(#healthGradTl)" strokeWidth={2} name="Health Score"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {improvements.length > 0 && (
        <div className="forecast-box">
          <div className="forecast-title">Simulate improvements — what could change your future</div>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
            {improvements.map((imp, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:10, fontSize:'.85rem', color:'var(--text)'}}>
                <span style={{color:'var(--teal)', fontSize:'.7rem'}}>▲</span> {imp}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}