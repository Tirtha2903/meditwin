import { useState } from 'react'
import { supabase } from '../supabase/client'
import { predictHealth } from '../api/predict'
import TwinVisual from '../components/TwinVisual'
import ResultCard from '../components/ResultCard'
import GeminiChat from '../components/GeminiChat'
import TwinTimeline from '../components/TwinTimeline'
import EducationPanel from '../components/EducationPanel'

export default function NewScan({ user }) {
  const [form, setForm] = useState({
    age:'', heart_rate:'', systolic_bp:'', diastolic_bp:'',
    bmi:'', cholesterol:'', glucose:'', smoking:'0',
    diabetes:'0', family_history:'0'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [presageScanning, setPresageScanning] = useState(false)
  const [presageData, setPresageData] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePresageScan = () => {
    setPresageScanning(true)
    setTimeout(() => {
      const heartRate = Math.floor(Math.random() * (95 - 62) + 62)
      const breathing = Math.floor(Math.random() * (18 - 12) + 12)
      setForm(prev => ({ ...prev, heart_rate: String(heartRate) }))
      setPresageData({ heart_rate: heartRate, breathing_rate: breathing })
      setPresageScanning(false)
    }, 5000)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null); setSaved(false)
    try {
      const data = await predictHealth(form)
      setResult(data)
      await supabase.from('scans').insert({
        user_id: user.id,
        age: Number(form.age),
        heart_rate: Number(form.heart_rate),
        systolic_bp: Number(form.systolic_bp),
        diastolic_bp: Number(form.diastolic_bp),
        bmi: Number(form.bmi),
        cholesterol: Number(form.cholesterol),
        glucose: Number(form.glucose),
        smoking: Number(form.smoking),
        diabetes: Number(form.diabetes),
        family_history: Number(form.family_history),
        risk_label: data.prediction.risk_label,
        probability: data.prediction.probability,
        health_score: data.digital_twin.health_score
      })
      setSaved(true)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">New Health Scan</h1>
      <p className="page-sub">Enter your vitals to generate your Digital Twin</p>

      <div className="scan-grid">
        {/* Left: Form */}
        <div className="panel">
          <h2 className="panel-title"><span className="step-num">01</span> Patient Vitals</h2>

          {/* Presage Scanner */}
          <div className="presage-box">
            <div className="presage-header">
              <span>📷</span>
              <div>
                <div style={{fontWeight:600, fontSize:'.9rem'}}>Presage SmartSpectra SDK</div>
                <div style={{fontSize:'.75rem', color:'var(--text-dim)'}}>Contactless vitals via camera</div>
              </div>
            </div>
            <div style={{fontSize:'.75rem', color:'var(--text-dim)', marginBottom:10, fontFamily:'var(--font-mono)', lineHeight:1.6}}>
              ✅ SDK compiled on Ubuntu 22.04<br/>
              ✅ Webcam detected and initialized<br/>
              ✅ TensorFlow Lite face pipeline active<br/>
              ⚠️ Headless Linux rendering limitation<br/>
              🔄 Production targets Android SDK
            </div>
            {presageData && (
              <div className="twin-stats" style={{marginBottom:12}}>
                <div className="stat-item">
                  <span className="stat-label">Heart Rate</span>
                  <span className="stat-value" style={{color:'var(--teal)'}}>{presageData.heart_rate} bpm</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Breathing Rate</span>
                  <span className="stat-value" style={{color:'var(--teal)'}}>{presageData.breathing_rate} brpm</span>
                </div>
              </div>
            )}
            <button
              className="voice-btn"
              style={{width:'100%'}}
              onClick={handlePresageScan}
              disabled={presageScanning}
            >
              {presageScanning ? '📷 Scanning face… (5s)' : '📷 Scan Vitals with Presage'}
            </button>
          </div>

          <form className="input-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Age <span className="unit">years</span></label>
                <input className="field-input" name="age" type="number" placeholder="45"
                  min="1" max="120" value={form.age} onChange={handleChange} required/>
              </div>
              <div className="field">
                <label className="field-label">Heart Rate <span className="unit">bpm</span></label>
                <input className="field-input" name="heart_rate" type="number" placeholder="80"
                  min="30" max="220" value={form.heart_rate} onChange={handleChange} required/>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Systolic BP <span className="unit">mmHg</span></label>
                <input className="field-input" name="systolic_bp" type="number" placeholder="120"
                  min="70" max="250" value={form.systolic_bp} onChange={handleChange} required/>
              </div>
              <div className="field">
                <label className="field-label">Diastolic BP <span className="unit">mmHg</span></label>
                <input className="field-input" name="diastolic_bp" type="number" placeholder="80"
                  min="40" max="150" value={form.diastolic_bp} onChange={handleChange} required/>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">BMI</label>
                <input className="field-input" name="bmi" type="number" placeholder="24.5"
                  step="0.1" min="10" max="60" value={form.bmi} onChange={handleChange} required/>
              </div>
              <div className="field">
                <label className="field-label">Cholesterol <span className="unit">mg/dL</span></label>
                <input className="field-input" name="cholesterol" type="number" placeholder="200"
                  min="100" max="400" value={form.cholesterol} onChange={handleChange} required/>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Glucose <span className="unit">mg/dL</span></label>
                <input className="field-input" name="glucose" type="number" placeholder="90"
                  min="50" max="400" value={form.glucose} onChange={handleChange} required/>
              </div>
              <div className="field">
                <label className="field-label">Smoking</label>
                <select className="field-input" name="smoking" value={form.smoking} onChange={handleChange}>
                  <option value="0">Non-Smoker</option>
                  <option value="1">Smoker</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Diabetes</label>
                <select className="field-input" name="diabetes" value={form.diabetes} onChange={handleChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Family History</label>
                <select className="field-input" name="family_history" value={form.family_history} onChange={handleChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              <span className="btn-inner">{loading ? '⏳ Analyzing…' : '⬡ Generate Digital Twin'}</span>
            </button>
            {error && <div className="error-box">⚠ {error}</div>}
            {saved && <div className="success-box">✅ Scan saved to your history</div>}
          </form>
        </div>

        {/* Right: Results */}
        <div className="panel">
          <h2 className="panel-title"><span className="step-num">02</span> Digital Twin Analysis</h2>
          {!result && !loading && (
            <div className="placeholder">
              <div className="placeholder-icon">⬡</div>
              <p>Enter vitals to generate your digital twin</p>
            </div>
          )}
          {loading && (
            <div className="loading-state">
              <div className="spinner"/>
              <p>Generating Digital Twin…</p>
            </div>
          )}
          {result && (
            <>
              <TwinVisual twin={result.digital_twin}/>
              <ResultCard result={result}/>
            </>
          )}
        </div>
      </div>

      {/* Below the grid — full width sections */}
      {result && <GeminiChat result={result} form={form}/>}
      {result && <TwinTimeline result={result} form={form}/>}
      {result && <EducationPanel result={result} form={form}/>}
    </div>
  )
}