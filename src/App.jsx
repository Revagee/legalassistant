import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Landing from './pages/landing/Landing.jsx'
import TemplatesIndex from './pages/TemplatesIndex.jsx'
import TemplateForm from './pages/TemplateForm.jsx'
import Generated from './pages/Generated.jsx'
import AIChat from './pages/AIChat.jsx'
import Dictionary from './pages/Dictionary.jsx'
import Database from './pages/Database.jsx'
import DatabaseResults from './pages/DatabaseResults.jsx'
import DatabaseRead from './pages/DatabaseRead.jsx'
import Documents from './pages/Documents.jsx'
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
import Subscription from './pages/Subscription.jsx'
import SubscriptionPayment from './pages/SubscriptionPayment.jsx'
import SubscriptionSuccess from './pages/SubscriptionSuccess.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Title from './components/Title.jsx'
import Contacts from './pages/Contacts.jsx'
import Refunds from './pages/Refunds.jsx'
import Delivery from './pages/Delivery.jsx'
import Merchant from './pages/Merchant.jsx'
import Pricing from './pages/Pricing.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<><Title title="Головна" /><Landing /></>} />
          <Route path="/templates" element={<><Title title="Шаблони документів" /><TemplatesIndex /></>} />
          <Route path="/template" element={<><Title title="Створення документа" /><TemplateForm /></>} />
          <Route path="/generated" element={<><Title title="Сгенеровані документи" /><Generated /></>} />
          <Route path="/ai" element={<><Title title="AI-чат" /><AIChat /></>} />
          <Route path="/dictionary" element={<><Title title="Юридичний словник" /><Dictionary /></>} />
          <Route path="/database" element={<><Title title="Правова база" /><Database /></>} />
          <Route path="/database/results" element={<><Title title="Результати пошуку" /><DatabaseResults /></>} />
          <Route path="/database/read" element={<><Title title="Документ" /><DatabaseRead /></>} />
          <Route path="/account" element={<><Title title="Аккаунт" /><Account /></>} />
          <Route path="/auth/login" element={<><Title title="Вхід" /><Login /></>} />
          <Route path="/auth/register" element={<><Title title="Реєстрація" /><Register /></>} />
          <Route path="/forgot" element={<><Title title="Відновлення доступу" /><Forgot /></>} />
          <Route path="/auth/check-email" element={<><Title title="Перевірте пошту" /><CheckEmail /></>} />
          <Route path="/reset-password" element={<><Title title="Скидання пароля" /><Reset /></>} />
          <Route path="/verify-email" element={<><Title title="Підтвердження email" /><VerifyEmail /></>} />
          <Route path="/auth/verify-success" element={<><Title title="Email підтверджений" /><VerifySuccess /></>} />
          <Route path="/trainer" element={<><Title title="Тренажер" /><TrainerIndex /></>} />
          <Route path="/trainer/quiz" element={<><Title title="Quiz" /><TrainerQuiz /></>} />
          <Route path="/trainer/result" element={<><Title title="Результат" /><TrainerResult /></>} />
          <Route path="/trainer/simple-demo" element={<><Title title="Демо Quiz" /><SimpleQuizDemo /></>} />
          <Route path="/documents" element={<><Title title="Документи" /><Documents /></>} />
          <Route path="/subscription" element={<><Title title="Підписка" /><Subscription /></>} />
          <Route path="/subscription/payment" element={<><Title title="Оплата підписки" /><SubscriptionPayment /></>} />
          <Route path="/subscription/success" element={<><Title title="Оплата успішна" /><SubscriptionSuccess /></>} />
          <Route path="/privacy" element={<><Title title="Політика конфіденційності" /><Privacy /></>} />
          <Route path="/terms" element={<><Title title="Умови користування" /><Terms /></>} />
          <Route path="/contacts" element={<><Title title="Контакти" /><Contacts /></>} />
          <Route path="/refunds" element={<><Title title="Повернення коштів" /><Refunds /></>} />
          <Route path="/delivery" element={<><Title title="Доставка та отримання" /><Delivery /></>} />
          <Route path="/merchant" element={<><Title title="Про власника" /><Merchant /></>} />
          <Route path="/pricing" element={<><Title title="Ціни" /><Pricing /></>} />
          <Route path="*" element={<><Title title="Сторінка не знайдена" /><NotFound /></>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
