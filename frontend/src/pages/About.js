import React from 'react';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Lead Developer",
      bio: "Alex has over 10 years of experience in agricultural technology and full-stack development. He leads the technical development of AgriVerse360.",
      image: "https://images.unsplash.com/photo-1507003211169-0a24e0e7d3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      name: "Maria Garcia",
      role: "AI Specialist",
      bio: "Maria is an expert in machine learning and computer vision. She developed the disease detection algorithms and crop identification systems.",
      image: "https://images.unsplash.com/photo-1573496359142-8273bdd0e954?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 3,
      name: "James Wilson",
      role: "IoT Engineer",
      bio: "James specializes in IoT systems and sensor networks. He designed the hardware infrastructure and real-time data collection systems.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 4,
      name: "Sarah Chen",
      role: "UX Designer",
      bio: "Sarah focuses on creating intuitive user experiences for farmers. She designed the interface and user workflows for AgriVerse360.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <div className="py-8">
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-8 text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About AgriVerse360</h1>
          <p className="text-xl mb-8">Revolutionizing Agriculture with Smart Technology</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6">Our Mission</h2>
            <p className="text-lg mb-4">
              AgriVerse360 is dedicated to empowering farmers with cutting-edge technology to optimize crop yields, 
              reduce resource waste, and make informed decisions about their agricultural practices.
            </p>
            <p className="text-lg mb-4">
              Our platform combines IoT sensors, AI-powered analytics, and intuitive interfaces to create a comprehensive 
              farming solution that adapts to the unique needs of each farm.
            </p>
            <p className="text-lg">
              We believe that sustainable agriculture is key to feeding the world's growing population while preserving 
              our environment for future generations.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6">How It Helps Rural Users</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-green-500 text-2xl mr-4">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Accessibility</h3>
                  <p>Simple interfaces designed for users with varying levels of technical expertise</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-2xl mr-4">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Offline Capability</h3>
                  <p>Core functionality available even with limited internet connectivity</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-2xl mr-4">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Voice Control</h3>
                  <p>Hands-free operation through our voice assistant for busy farmers</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-2xl mr-4">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Multilingual Support</h3>
                  <p>Available in multiple languages to serve diverse farming communities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Our Team</h2>
          <p className="text-lg text-center mb-10">Meet the passionate individuals behind AgriVerse360</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                />
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6">Technology Overview</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-bold mb-2">IoT Sensors</h3>
                <p>
                  Our network of soil moisture, temperature, and humidity sensors provides real-time data 
                  to inform irrigation and crop management decisions.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-bold mb-2">AI & Machine Learning</h3>
                <p>
                  Advanced algorithms analyze plant images to detect diseases early and recommend 
                  targeted treatments to minimize crop loss.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-bold mb-2">Predictive Analytics</h3>
                <p>
                  Historical data and weather forecasts are used to predict optimal planting, 
                  watering, and harvesting times for maximum yield.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6">Project at SJCE</h2>
            <p className="text-lg mb-4">
              AgriVerse360 was developed as a final year project at Sri Jayachamarajendra College of Engineering (SJCE), 
              Mysore, by a team of passionate engineering students dedicated to agricultural innovation.
            </p>
            <p className="text-lg mb-4">
              Under the guidance of Dr. Ramesh Babu, Professor of Electronics and Communication Engineering, 
              our team worked tirelessly to create a solution that could make a real difference in the agricultural sector.
            </p>
            <p className="text-lg">
              We're proud to represent SJCE in developing technology that addresses one of the most critical 
              challenges facing our world today - sustainable food production.
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-8 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">See AgriVerse360 in Action</h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              <div className="w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="mt-4 text-xl">Product Demo Video</p>
                  <p className="mt-2 opacity-75">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;