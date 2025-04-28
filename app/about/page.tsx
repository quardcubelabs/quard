"use client"

import { motion } from "framer-motion"
import { teamMembers, companyHistory, faqs } from "@/lib/data"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <main className="min-h-screen bg-teal text-navy">
      <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
      <Navbar />

      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">
              About <span className="gradient-text">QuardCubeLabs</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-navy/80 max-w-3xl mx-auto">
              Learn about our company, our mission, and the team behind our innovative solutions
            </p>
          </div>

          {/* Company Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-20 md:mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-2xl overflow-hidden border-2 border-navy/20">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="QuardCubeLabs office"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-navy/80 mb-6">
                QuardCubeLabs was founded in 2008 with a vision to transform how businesses leverage technology. What
                began as a small team of passionate technologists has grown into a comprehensive IT solutions provider
                serving clients across various industries worldwide.
              </p>
              <p className="text-navy/80 mb-8">
                Our journey has been defined by a commitment to innovation, excellence, and client success. We've
                evolved our service offerings to address the changing technology landscape while maintaining our core
                values of integrity, expertise, and client-focused solutions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">Our Mission</h3>
                    <p className="text-navy/80">
                      To empower businesses through innovative technology solutions that drive growth, efficiency, and
                      competitive advantage.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">Our Vision</h3>
                    <p className="text-navy/80">
                      To be the trusted technology partner for businesses seeking to thrive in the digital era.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">Our Values</h3>
                    <p className="text-navy/80">
                      Innovation, Excellence, Integrity, Collaboration, and Client Success.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button className="bg-navy hover:bg-navy/90 text-white rounded-full">
                  Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Company History */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-navy/80 max-w-3xl mx-auto">
                The evolution of QuardCubeLabs from its founding to the present day
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-navy/20"></div>

              <div className="space-y-12">
                {companyHistory.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                      <div className="bg-white/50 rounded-2xl border-2 border-navy/20 p-6">
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-navy/80">{event.description}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold z-10 relative">
                        {event.year}
                      </div>
                    </div>

                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
              <p className="text-xl text-navy/80 max-w-3xl mx-auto">
                Meet the experts behind QuardCubeLabs' innovative solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/50 rounded-2xl border-2 border-navy/20 overflow-hidden transition-all duration-300 hover:border-navy hover:shadow-lg">
                    <div className="relative overflow-hidden">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={400}
                        height={400}
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex gap-2 justify-center">
                          {member.socialMedia.linkedin && (
                            <a
                              href={member.socialMedia.linkedin}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </a>
                          )}
                          {member.socialMedia.twitter && (
                            <a
                              href={member.socialMedia.twitter}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-brand-red mb-4">{member.role}</p>
                      <p className="text-navy/80 text-sm mb-4 line-clamp-3">{member.bio}</p>

                      <div className="flex flex-wrap gap-2">
                        {member.expertise.slice(0, 2).map((skill, i) => (
                          <span key={i} className="text-xs bg-navy/10 text-navy px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {member.expertise.length > 2 && (
                          <span className="text-xs bg-navy/10 text-navy px-2 py-1 rounded-full">
                            +{member.expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-navy/80 max-w-3xl mx-auto">
                Find answers to common questions about our services and approach
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div
                      className={`bg-white/50 rounded-2xl border-2 ${openFaq === index ? "border-navy" : "border-navy/20"} overflow-hidden transition-all duration-300`}
                    >
                      <button
                        className="flex justify-between items-center w-full p-6 text-left"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="text-lg font-bold">{faq.question}</h3>
                        <div className="flex-shrink-0 ml-4">
                          {openFaq === index ? (
                            <Minus className="h-5 w-5 text-navy" />
                          ) : (
                            <Plus className="h-5 w-5 text-navy" />
                          )}
                        </div>
                      </button>

                      {openFaq === index && (
                        <div className="px-6 pb-6">
                          <p className="text-navy/80">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-navy/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
            <p className="text-xl text-navy/80 max-w-3xl mx-auto mb-8">
              Contact us today to discuss how we can help your business thrive in the digital landscape
            </p>
            <Link href="/contact">
              <Button className="bg-navy hover:bg-navy/90 text-white rounded-full px-8 py-6 text-lg">
                Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
