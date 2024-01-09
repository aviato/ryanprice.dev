import { besley } from "./fonts";
import ExpInfo from "../lib/ExpInfo";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <header className="mx-6 mt-12 mb-24 md:mx-12 md:mt-20 md:mb-36 lg:mx-auto lg:w-1/2">
        <h1 className={`text-5xl font-bold text-slate-200 ${besley.className}`}>
          Ryan Price
        </h1>
        <p className="text-2xl font-semibold mt-4">Software Engineer</p>
        <p className="mt-4 text-slate-300">
          I bring pixel-perfect and responsive designs to life 🌱
        </p>
        <ul aria-label="Social Links" className="flex mt-4">
          <li className="mr-2">
            <a href="https://github.com/aviato">Github</a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/rsprice/">LinkedIn</a>
          </li>
        </ul>
      </header>

      <main className="mx-6 md:mx-12 lg:mx-auto lg:w-1/2">
        <section>
          <h2 className="text-xl">About Me:</h2>
          <p className="mt-4">
            I have been working full time as a software engineer since 2016. I
            love bringing things to life on the page, so I naturally favor front
            end work, but I have worked on full stack projects before as well. I
            have worked remotely since 2019, so I am completely fine working
            from home, but I love to interact with people in person as well!{" "}
          </p>
          <br />
          <p>
            When I&apos;m not at my desk solving problems, you can find me out in
            nature camping and playing music.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl">Professional Experience:</h2>
          <ol>
            <li>
              <ExpInfo
                companyName={"Savage X Fenty"}
                jobTitle={"Senior Software Engineer"}
                dateRange={"September 2021 - May 2023"}
                technologies={[
                  "Next.js",
                  "React",
                  "Redux",
                  "TypeScript",
                  "MySQL",
                  "CMS",
                  "Localization",
                  "Jenkins",
                  "Ecommerce",
                ]}
              >
                During my tenure at Savage X Fenty, I played a pivotal role in
                the success of a high-traffic Ecommerce web application,
                contributing to the development of Next.js, React, and Redux
                code. In close collaboration with the product team, I crafted
                robust solutions for feature tracking, analytics, A/B Testing,
                localization, and CMS integration. This comprehensive approach
                significantly enhanced the overall user experience.
                Additionally, I consistently delivered critical features and bug
                fixes, ensuring the continuous improvement and seamless
                functionality of the platform.
                <br />
                <br />
                As a seasoned leader, I spearheaded teams of 5 or more
                engineers, providing guidance in the architecture and planning
                of key engineering efforts crucial to business-critical product
                launches. My impact extended beyond Savage X Fenty, as I proudly
                served as a member of the React Oversight and TypeScript
                committees, actively contributing to the evolution of these
                technologies. In tandem, I took on a mentoring role, fostering
                the growth of junior developers through pair programming
                sessions and rigorous code reviews.
              </ExpInfo>
            </li>
            <li>
              <ExpInfo
                companyName={"Billups"}
                jobTitle={"Front End Engineering Team Lead"}
                dateRange={"January 2021 - August 2021"}
                technologies={[
                  "React",
                  "Redux",
                  "TypeScript",
                  "AWS",
                  "AG Grid",
                  "MapboxGL",
                  "Node.js",
                  "Golang",
                ]}
              >
                As a Front End Engineering Team Lead at Billups, I led a small
                and dynamic team, overseeing the planning, development, and
                maintenance of multiple applications. Notably, I was promoted to
                this position during my tenure at the company, showcasing the
                recognition of my contributions and leadership skills. I
                excelled in translating product business requirements into
                technical user stories, fostering effective communication within
                the team and ensuring alignment with overarching objectives.
                <br />
                <br />
                In my role, I prioritized mentorship, providing valuable
                guidance to the team and creating comprehensive documentation
                for best practices and company processes. Collaboration was a
                cornerstone of my approach, and I actively worked with the back
                end team to design APIs, fostering parity between services and
                front-end applications. This collaborative effort contributed
                significantly to the overall efficiency and cohesion of our
                development endeavors.
              </ExpInfo>
            </li>
            <li>
              <ExpInfo
                companyName={"Billups"}
                jobTitle={"Front End Engineer"}
                dateRange={"November 2018 - January 2021"}
                technologies={[
                  "React",
                  "Redux",
                  "TypeScript",
                  "AWS",
                  "AG Grid",
                  "MapboxGL",
                  "Node.js",
                  "Golang",
                  "MaterialUI",
                ]}
              >
                As a Front End Engineer at Billups from November 2018 to January
                2021, I played a crucial role in advancing the technological
                landscape of a company committed to reshaping its industry
                through cutting-edge technology and automation. My contributions
                extended to a significant overhaul of CI/CD processes for our
                team, where I established build and deploy steps utilizing AWS,
                Kubernetes, and Drone, optimizing our development workflow.
                <br />
                <br />
                Within this innovative environment, I actively contributed to
                the internal component library, collaborating closely with the
                UX team to design reusable solutions. My proficiency in
                TypeScript, React, Redux, and RXjs was instrumental in
                architecting and implementing product requests as new features,
                further elevating the capabilities of our applications. This
                period of my career was marked by a commitment to pushing
                boundaries and leveraging the latest technologies to drive
                impactful changes within the company.
              </ExpInfo>
            </li>
            <li>
              <ExpInfo
                companyName={"Womply"}
                jobTitle={"Software Engineer III"}
                dateRange={"August 2017 - August 2018"}
                technologies={[
                  "AngularJS",
                  "CircleCI",
                  "Protractor",
                  "BrowserStack",
                  "Jasmine",
                  "Node.js",
                ]}
              >
                I made significant contributions to both the evolution of
                existing products and the creation of new solutions for an
                application serving over one hundred thousand small businesses.
                My focus encompassed writing reusable and production-ready UI
                components using AngularJS within a large-scale application.
                <br />
                <br />
                Operating in a dynamic and agile environment, I collaborated
                closely with cross-functional teams, including UX, product, and
                back end, to meet demanding deadlines. A key aspect of my work
                involved translating design mocks into reality, ensuring
                pixel-perfect and responsive implementations across multiple
                browsers, including Chrome, Firefox, and IE. Additionally, I
                actively participated in cross-platform mobile application
                development, leveraging the Ionic framework to enhance the
                application&apos;s accessibility and reach.
              </ExpInfo>
            </li>
            <li>
              <ExpInfo
                companyName={"Billups"}
                jobTitle={"Software Engineer I & II"}
                dateRange={"April 2016 - August 2017"}
                technologies={[
                  "React",
                  "Redux",
                  "MapboxGL",
                  "Mocha",
                  "Karma",
                  "Chai",
                  "Webpack",
                  "Bootstrap",
                ]}
              >
                I collaborated within a small team of software engineers to
                develop an internal web application tailored for the media
                industry. My responsibilities included the creation of a robust
                test harness, utilizing Mocha, Karma, Chai, and Webpack to
                automate tests across multiple browsers. This strategic
                implementation not only increased test coverage but also
                generated comprehensive coverage reports to ensure the
                application&apos;s reliability.
                <br />
                <br />
                In the realm of front-end development, I leveraged React, Redux,
                and ES6 to craft reusable UI components for a single-page web
                application. This approach not only streamlined the development
                process but also contributed to the overall efficiency and
                maintainability of the internal web application designed to meet
                the specific needs of the media industry.
              </ExpInfo>
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-xl">Projects:</h2>
          <ul>
            <li>
              <ExpInfo
                companyName={"whatifmachine.ai"}
                jobTitle={"Lead Developer"}
                dateRange={"November 2023 - Current"}
                technologies={[
                  "Svelte",
                  "SvelteKit",
                  "Digital Ocean",
                  "Cloudflare Workers",
                  "PostgresQL",
                  "OpenAI API",
                  "Figma",
                ]}
              >
                I had been itching to work on a project using SvelteKit, and do
                something with OpenAI&apos;s API, so on this project I did both! The
                project is very simple: take a prompt from the user and generate
                a short science fiction story with images from DALL·E.
              </ExpInfo>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
