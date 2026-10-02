import phoneMockup from '../assets/Group 10.png';
import Brandlogo from '../assets/Vector 6 (1).png';
import Insight from '../assets/uis_graph-bar.png';
import Meter from '../assets/ant-design_thunderbolt-filled.png';
import Trend from '../assets/fluent_form-multiple-28-filled.png';
import AiIcon from '../assets/Rectangle 177.png';
import IMockup from '../assets/iMockup - iPhone 15 Pro Max.png';
import Easy from '../assets/mdi_register.png';
import Pay from '../assets/si_meter-fill.png';
import link from '../assets/fluent_payment-28-filled.png';
import Track from '../assets/mingcute_ai-fill.png';
import Star from '../assets/mingcute_ai-fill (1).png';
import User1 from '../assets/Rectangle 166.png';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import User2 from '../assets/Group 5.png';
import User3 from '../assets/Rectangle 170.png';
import { MdOutlineFileDownload } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import CommunityProfileCard from '../components/CommunityProfileCard';

const Home = () => {
  const gradientClass = 'bg-gradient-to-br from-[#F55A08] to-orange-500';

  useEffect(() => {
    // quick mount check
    try {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Home mounted');
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-[#F55A08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <img src={Brandlogo} alt="brand-logo" />
            <div className="hidden md:flex space-x-12">
              {['How it works', 'Features', 'Testimonials', 'Support'].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
                    className="text-white text-xl hover:text-orange-200 transition"
                  >
                    {item}
                  </a>
                ),
              )}
            </div>
            {/* <Link to="/waitlist">waitlist</Link> */}
            <Link
              to="/Waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#F55A08] px-5 py-2.5 rounded-lg font-medium hover:bg-orange-50 transition"
            >
              Join The Waitlist
            </Link>
          </div>
        </div>
      </nav>

      <section
        className={`${gradientClass} text-white py-20 md:py-28 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold leading-tight mb-6">
              Power Your Home Instantly, Manage Your Energy Smartly
            </h1>
            <p className="text-lg md:text-xl opacity-95 mb-10 leading-relaxed">
              Experience zero-stress prepaid meter recharges and AI-driven
              energy savings tailored to your unique consumption patterns.
            </p>

            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#F55A08] px-5 py-2.5 rounded-lg font-medium hover:bg-orange-50 transition"
            >
              Download Now
            </a>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative max-w-[320px] w-full md:max-w-[380px] lg:max-w-[500px]">
              <img
                src={phoneMockup}
                alt="Deyra app"
                className="w-full h-auto drop-shadow-2xl"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-transparent rounded-[3rem] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
            Core Features
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Everything you need to manage consumption in one simplified
            interface.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Meter,
                title: 'Instant Meter Recharge',
                desc: 'Get your tokens instantly with zero latency. Never stay in the dark again with our 24/7 uptime.',
              },
              {
                icon: Insight,
                title: 'Debt Insights',
                desc: 'Full transparency on your outstanding utility balances and historical payment breakdown.',
              },
              {
                icon: Trend,
                title: 'Usage Trends',
                desc: 'Visualize your energy consumption patterns with smart interactive charts and monthly reports.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`${gradientClass} text-white p-8 rounded-2xl hover:shadow-2xl transition hover:-translate-y-1`}
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6">
                  <img src={feature.icon} alt={feature.title} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="howitworks" className="bg-[#f9f9f9] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
            How it Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mb-20">
            Start recharging your meters in four simple steps. We handle the
            logistics so you can focus on your work.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                icon: Easy,
                title: 'Easy Registration',
                desc: 'Sign up in under 60 seconds with just your phone number.',
              },
              {
                num: '02',
                icon: Pay,
                title: 'Link your Meter',
                desc: 'Add your meter number once, we will remember it for life.',
              },
              {
                num: '03',
                icon: link,
                title: 'Pay & Recharge',
                desc: 'Secure payment via card, Bank Transfer, or USSD',
              },
              {
                num: '04',
                icon: Track,
                title: 'Track & save',
                desc: 'Get insights and AI tips to lower your next bill',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl px-6 pt-10 pb-8 shadow-sm"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-8">
                  <img src={step.icon} className="w-6 h-6" alt="" />
                </div>
                <span className="absolute top-8 right-6 text-6xl font-extrabold text-gray-200">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${gradientClass} py-20 text-white relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative max-w-[320px] w-full md:max-w-[380px] lg:max-w-[500px]">
            <img
              src={AiIcon}
              alt="AI Assistant"
              className="w-full h-auto drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-transparent rounded-[3rem] pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src={Star} className="w-5 h-5" alt="star" />
              <span className="text-sm font-black tracking-wider uppercase">
                P4L AI ASSISTANT
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-10 max-w-lg">
              Your Personal Energy Efficiency Coach
            </h2>
            <div className="space-y-10">
              {[
                {
                  title: 'Daily Energy Saving Tips',
                  desc: 'Receive personalized alerts on how to reduce your monthly by up to 25%.',
                },
                {
                  title: '24/7 AI Support',
                  desc: 'Instant answer to your billings questions and troubleshooting steps for your meter.',
                },
                {
                  title: 'Smart Prediction',
                  desc: 'Our AI predicts when your units will run out based on current usage trends.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="w-3 h-3 text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="leading-tight">
                    <p className="text-lg">
                      <span className="font-black">{item.title}:</span>{' '}
                      <span className="text-white/90 font-medium">
                        {item.desc}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-extrabold mb-16 leading-tight">
            What people are saying about{' '}
            <span className="text-orange-600">Deyra</span>
          </h2>
          {[
            {
              name: 'David Adebayo',
              image: User1,
              metric: '99%',
              label: 'Customer Satisfaction',
              text: 'There is nothing worse than that beeping sound your meter makes right before the power cuts out... I downloaded Deyra in a panic and it worked instantly.',
            },
            {
              name: 'Joy Bolwatife',
              image: User2,
              metric: '5x',
              label: 'Faster Transactions',
              text: 'Deyra has been a total game-changer for our family. I just open the app, buy units for both meters in one go. The transparency is amazing.',
            },
            {
              name: 'David Chike',
              image: User3,
              metric: '99%',
              label: 'Customer Satisfaction',
              text: 'The interface is so clean. No confusion, no clutter. Recharge, track usage, done. I’ve recommended it to everyone in my estate.',
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-[#FFDCC7] border-b border-white py-14 px-10 grid md:grid-cols-[200px_1fr_200px] gap-10 items-center"
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-40 h-40 object-cover"
              />
              <div>
                <h4 className="font-bold mb-3">{t.name}</h4>
                <p className="text-sm leading-relaxed max-w-xl mb-4">
                  “{t.text}”
                </p>
                <div className="text-orange-600 text-lg">★★★★★</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-extrabold text-red-600">
                  {t.metric}
                </div>
                <p className="text-xs mt-2">{t.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#fff5ef] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              Community spotlight
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              See the kind of conversations your users are already joining.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Real-time power alerts, trusted energy tips, and local community
              updates tailored to how members engage.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/new-user-dashboard"
                className="rounded-xl bg-[#F55A08] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Explore dashboard
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                Explore features
              </a>
            </div>
          </div>

          <CommunityProfileCard />
        </div>
      </section>

      <section id="support" className="bg-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <h2 className="text-6xl font-extrabold leading-tight mb-16 uppercase">
            Need more help?
          </h2>
          <div
            className={`relative ${gradientClass} rounded-[32px] px-14 py-14 flex items-center shadow-xl`}
          >
            <div className="max-w-2xl text-white">
              <h3 className="text-3xl font-bold mb-6">
                We’re Here to Keep the Lights On
              </h3>
              <p className="text-base leading-relaxed mb-10 opacity-95">
                At Deyra, we understand that electricity isn’t just a
                utility — it is a necessity. Our team is on standby to resolve
                any network glitch or delayed token immediately.
              </p>
              <div className="flex flex-wrap gap-4">
                {/* Get the App Button */}
                <button className="bg-white text-black text-base px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                  <MdOutlineFileDownload className="text-xl" />
                  <span>Get the App</span>
                </button>

                {/* WhatsApp Support Button */}
                <button className="bg-white text-black text-base px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                  <FaWhatsapp className="text-[#25D366] text-xl" />
                  <span>WhatsApp Support</span>
                </button>
              </div>
            </div>
            <img
              src={IMockup}
              alt="App preview"
              className="absolute right-[-40px] bottom-[30px] w-[340px] h-[550px] hidden lg:block"
            />
          </div>
        </div>
      </section>

      <footer className={`${gradientClass} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <img
              src={Brandlogo}
              className="w-[266px] h-[60px] mb-4"
              alt="logo"
            />
            <p className="text-sm opacity-90">
              Nigeria’s trusted platform for instant meter recharge, energy
              tracking, and smart saving tips.
            </p>
          </div>
          {[
            {
              title: 'Quick Links',
              links: ['How it works', 'Features', 'Testimonials', 'Home'],
            },
            {
              title: 'Contact Us',
              links: [
                'Victoria Island, Lagos',
                '+234 957 586 90543',
                'meetus@pay4light.ng',
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-bold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm opacity-90">
                {col.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Home;
