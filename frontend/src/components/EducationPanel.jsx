export default function EducationPanel({ result, form }) {
  const vitals = [
    {
      name: 'Heart Rate',
      value: Number(form.heart_rate),
      unit: 'bpm',
      normal: '60–100',
      low: 60, high: 100,
      explain: (v) => v < 60
        ? `Your heart rate of ${v} bpm is below normal (bradycardia). This can indicate excellent fitness or an underlying condition.`
        : v > 100
        ? `Your heart rate of ${v} bpm is elevated (tachycardia). Sustained high HR increases cardiac workload.`
        : `Your heart rate of ${v} bpm is in the normal range. Good cardiovascular efficiency.`
    },
    {
      name: 'Systolic BP',
      value: Number(form.systolic_bp),
      unit: 'mmHg',
      normal: '90–120',
      low: 90, high: 120,
      explain: (v) => v >= 140
        ? `Your systolic BP of ${v} mmHg is Stage 2 hypertension. This significantly increases stroke and heart attack risk.`
        : v >= 130
        ? `Your systolic BP of ${v} mmHg is Stage 1 hypertension. Lifestyle changes are recommended.`
        : `Your systolic BP of ${v} mmHg is normal. Healthy arteries and low pressure.`
    },
    {
      name: 'Diastolic BP',
      value: Number(form.diastolic_bp),
      unit: 'mmHg',
      normal: '60–80',
      low: 60, high: 80,
      explain: (v) => v > 90
        ? `Your diastolic BP of ${v} mmHg is high. This is the pressure between heartbeats and indicates artery stiffness.`
        : `Your diastolic BP of ${v} mmHg is healthy.`
    },
    {
      name: 'BMI',
      value: Number(form.bmi),
      unit: '',
      normal: '18.5–24.9',
      low: 18.5, high: 24.9,
      explain: (v) => v >= 30
        ? `Your BMI of ${v} indicates obesity. Excess weight strains the heart and increases blood pressure.`
        : v >= 25
        ? `Your BMI of ${v} indicates overweight. Even modest weight loss reduces cardiovascular risk.`
        : v < 18.5
        ? `Your BMI of ${v} is underweight. This can also indicate cardiac risk.`
        : `Your BMI of ${v} is in the healthy range.`
    },
    {
      name: 'Cholesterol',
      value: Number(form.cholesterol),
      unit: 'mg/dL',
      normal: '<200',
      low: 0, high: 200,
      explain: (v) => v >= 240
        ? `Your cholesterol of ${v} mg/dL is high. It builds up in arteries, narrowing them and causing heart disease.`
        : v >= 200
        ? `Your cholesterol of ${v} mg/dL is borderline high. Diet changes can help.`
        : `Your cholesterol of ${v} mg/dL is desirable.`
    },
    {
      name: 'Blood Glucose',
      value: Number(form.glucose),
      unit: 'mg/dL',
      normal: '70–99',
      low: 70, high: 99,
      explain: (v) => v >= 126
        ? `Your glucose of ${v} mg/dL indicates diabetes range. High blood sugar damages blood vessels over time.`
        : v >= 100
        ? `Your glucose of ${v} mg/dL is pre-diabetic. Early intervention can prevent progression.`
        : `Your glucose of ${v} mg/dL is normal fasting level.`
    },
  ]

  const getStatus = (value, low, high) => {
    if (value < low || value > high) return 'danger'
    if (value > high * 0.9 || value < low * 1.1) return 'warning'
    return 'good'
  }

  const statusColor = { good: 'var(--teal)', warning: 'var(--gold)', danger: 'var(--red)' }
  const statusLabel = { good: '✓ Normal', warning: '⚠ Borderline', danger: '✗ Abnormal' }

  return (
    <div className="panel" style={{marginTop:24}}>
      <h2 className="panel-title">
        <span className="step-num">05</span> Health Education — Understanding Your Results
      </h2>

      <div style={{display:'flex', flexDirection:'column', gap:16, marginBottom:24}}>
        {vitals.map((v, i) => {
          const status = getStatus(v.value, v.low, v.high)
          return (
            <div key={i} className="edu-card">
              <div className="edu-card-header">
                <div>
                  <span className="edu-vital-name">{v.name}</span>
                  <span className="edu-vital-value">{v.value}{v.unit}</span>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:'.7rem', color:statusColor[status]}}>
                    {statusLabel[status]}
                  </span>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:'.65rem', color:'var(--text-dim)'}}>
                    Normal: {v.normal} {v.unit}
                  </span>
                </div>
              </div>
              <div className="edu-bar-track">
                <div className="edu-bar-fill" style={{
                  width: `${Math.min(100, (v.value / (v.high * 1.5)) * 100)}%`,
                  background: statusColor[status]
                }}/>
                <div className="edu-bar-normal" style={{
                  left: `${(v.low / (v.high * 1.5)) * 100}%`,
                  width: `${((v.high - v.low) / (v.high * 1.5)) * 100}%`
                }}/>
              </div>
              <p style={{fontSize:'.83rem', color:'var(--text-dim)', lineHeight:1.6, marginTop:10}}>
                {v.explain(v.value)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Risk factors education */}
      <div className="forecast-box" style={{marginBottom:16}}>
        <div className="forecast-title">What is cardiovascular disease?</div>
        <p style={{fontSize:'.85rem', color:'var(--text)', lineHeight:1.7, marginTop:8}}>
          Cardiovascular disease (CVD) is the #1 cause of death globally, responsible for 17.9 million deaths per year.
          It refers to conditions affecting the heart and blood vessels — including heart attacks, strokes, and heart failure.
          Most CVD is preventable through early detection and lifestyle changes. MediTwin AI uses the same 10 risk factors
          validated by the <strong>Framingham Heart Study</strong> — a 75-year Harvard Medical School research program.
        </p>
      </div>

      <div className="forecast-box">
        <div className="forecast-title">How to reduce your risk</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          {[
            ['Exercise', '30 min of moderate activity 5x/week reduces risk by 35%'],
            ['Diet', 'Mediterranean diet reduces cardiovascular events by 30%'],
            ['Sleep', '7-9 hours of sleep reduces hypertension risk by 34%'],
            ['Stress', 'Chronic stress raises cortisol, increasing BP and heart rate'],
            ['Smoking', 'Quitting smoking halves your heart disease risk within a year'],
            ['Alcohol', 'Limiting to 1-2 drinks/day significantly reduces cardiac risk'],
          ].map(([title, desc], i) => (
            <div key={i} style={{background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px 14px'}}>
              <div style={{fontWeight:600, fontSize:'.82rem', marginBottom:4, color:'var(--teal)'}}>{title}</div>
              <div style={{fontSize:'.78rem', color:'var(--text-dim)', lineHeight:1.5}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}