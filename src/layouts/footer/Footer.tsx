import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0B2447] text-white py-12 px-6 md:px-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Address */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-5 h-5 mt-1" />
            <p>123 Street, New York, USA</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5" />
            <p>+012 345 67890</p>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5" />
            <p>name@domain.com</p>
          </div>
          <div className="flex gap-3">
            <Twitter className="w-6 h-6 cursor-pointer hover:text-blue-400" />
            <Facebook className="w-6 h-6 cursor-pointer hover:text-blue-600" />
            <Youtube className="w-6 h-6 cursor-pointer hover:text-red-500" />
            <Linkedin className="w-6 h-6 cursor-pointer hover:text-blue-500" />
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <ul className="space-y-2">
            {[
              "Cardiology",
              "Pulmonary",
              "Neurology",
              "Orthopedics",
              "Laboratory",
            ].map((service) => (
              <li key={service} className="hover:underline cursor-pointer">
                › {service}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            {[
              "About Us",
              "Contact Us",
              "Our Services",
              "Terms & Conditions",
              "Support",
            ].map((link) => (
              <li key={link} className="hover:underline cursor-pointer">
                › {link}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Newsletter</h2>
          <p className="mb-4 text-sm leading-6">
            Dolor amet sit justo amet elitr clita ipsum elitr est.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 rounded-l-md bg-white text-black w-full outline-none"
            />
            <button className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between text-sm">
        <p>© 2025 QXHub. All rights reserved</p>
        <p>
          Designed By{" "}
          <a href="#" className="underline hover:text-blue-400">
            QUIXUN Team
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
