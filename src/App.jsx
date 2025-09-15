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
import CheckEmail from './pages/auth/CheckEmail.jsx'
import VerifyEmail from './pages/auth/VerifyEmail.jsx'
import VerifySuccess from './pages/auth/VerifySuccess.jsx'
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
          <Route path="/templates" element={<TemplatesIndex />} />
          <Route path="/template" element={<TemplateForm />} />
          <Route path="/generated" element={<Generated />} />
          <Route path="/calculators" element={<CalculatorsIndex />} />
          <Route path="/calculators/fees" element={<Fees />} />
          <Route path="/calculators/interest" element={<Interest />} />
          <Route path="/calculators/penalty" element={<Penalty />} />
          <Route path="/calculators/esv" element={<Esv />} />
          <Route path="/calculators/alimony" element={<Alimony />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/database" element={<Database />} />
          <Route path="/database/results" element={<DatabaseResults />} />
          <Route path="/database/read" element={<DatabaseRead />} />
          <Route path="/account" element={<Account />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/auth/check-email" element={<CheckEmail />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/verify-success" element={<VerifySuccess />} />
          <Route path="/trainer" element={<TrainerIndex />} />
          <Route path="/trainer/quiz" element={<TrainerQuiz />} />
          <Route path="/trainer/result" element={<TrainerResult />} />
          <Route path="/trainer/simple-demo" element={<SimpleQuizDemo />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
