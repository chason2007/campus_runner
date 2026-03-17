import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Problem from '../components/Problem';
import HowItWorks from '../components/HowItWorks';
import Services from '../components/Services';
import AppPreview from '../components/AppPreview';
import AudienceTabs from '../components/AudienceTabs';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

function LandingPage() {
    return (
        <>
            <Navbar />
            <Hero />
            <Marquee />
            <Problem />
            <HowItWorks />
            <Services />
            <AudienceTabs />
            <Stats />
            <AppPreview />
            <Footer />
        </>
    );
}

export default LandingPage;
