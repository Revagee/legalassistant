import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Landing from './pages/landing/Landing.jsx'
import TemplatesIndex from './pages/TemplatesIndex.jsx'
import TemplateForm from './pages/TemplateForm.jsx'
import Generated from './pages/Generated.jsx'
import CalculatorsIndex from './pages/CalculatorsIndex.jsx'
import Fees from './pages/Fees.jsx'
import Interest from './pages/Interest.jsx'
import Penalty from './pages/Penalty.jsx'
import Esv from './pages/Esv.jsx'
import Alimony from './pages/Alimony.jsx'
import AIChat from './pages/AIChat.jsx'
import Dictionary from './pages/Dictionary.jsx'
import Database from './pages/Database.jsx'
import DatabaseResults from './pages/DatabaseResults.jsx'
import DatabaseRead from './pages/DatabaseRead.jsx'
import Account from './pages/Account.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Forgot from './pages/auth/Forgot.jsx'
import Reset from './pages/auth/Reset.jsx'
import TrainerIndex from './pages/trainer/Index.jsx'
import TrainerQuiz from './pages/trainer/Quiz.jsx'
import TrainerResult from './pages/trainer/Result.jsx'
import SimpleQuizDemo from './pages/trainer/SimpleQuizDemo.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ui" element={<TemplatesIndex />} />
          <Route path="/ui/template" element={<TemplateForm />} />
          <Route path="/ui/generated" element={<Generated />} />
          <Route path="/ui/calculators" element={<CalculatorsIndex />} />
          <Route path="/ui/calculators/fees" element={<Fees />} />
          <Route path="/ui/calculators/interest" element={<Interest />} />
          <Route path="/ui/calculators/penalty" element={<Penalty />} />
          <Route path="/ui/calculators/esv" element={<Esv />} />
          <Route path="/ui/calculators/alimony" element={<Alimony />} />
          <Route path="/ui/ai" element={<AIChat />} />
          <Route path="/ui/dictionary" element={<Dictionary />} />
          <Route path="/ui/database" element={<Database />} />
          <Route path="/ui/database/results" element={<DatabaseResults />} />
          <Route path="/ui/database/read" element={<DatabaseRead />} />
          <Route path="/ui/account" element={<Account />} />
          <Route path="/ui/auth/login" element={<Login />} />
          <Route path="/ui/auth/register" element={<Register />} />
          <Route path="/ui/auth/forgot" element={<Forgot />} />
          <Route path="/ui/auth/reset" element={<Reset />} />
          <Route path="/ui/trainer" element={<TrainerIndex />} />
          <Route path="/ui/trainer/quiz" element={<TrainerQuiz />} />
          <Route path="/ui/trainer/result" element={<TrainerResult />} />
          <Route path="/ui/trainer/simple-demo" element={<SimpleQuizDemo />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
