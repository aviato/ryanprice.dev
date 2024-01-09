import { besley } from "./fonts";
import ExpInfo from "../lib/ExpInfo";

export default function Home() {
  return (
    <div className="">
      <header className="mx-6 my-12 md:mx-12 md:my-20 lg:mx-auto lg:w-1/2">
        <h1 className={`text-5xl font-bold text-slate-200 ${besley.className}`}>
          Ryan Price
        </h1>
        <p className="text-2xl font-semibold mt-4">Software Engineer</p>
        <p className="mt-4 text-slate-300">
          I bring pixel-perfect and responsive designs to life 🌱
        </p>
        <a href="https://github.com/aviato">Github</a>
        <br />
        <a href="https://www.linkedin.com/in/rsprice/">LinkedIn</a>
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
            When I'm not at my desk solving problems, you can find me out in
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
                Wrote lots of code; React, MapboxGL, Webpack, etc.
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
                Wrote lots of code; React, MapboxGL, Webpack, etc.
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
                ]}
              >
                Wrote lots of code; React, MapboxGL, Webpack, etc.
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
                Wrote lots of code; React, MapboxGL, Webpack, etc.
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
                  "Webpack",
                ]}
              >
                Wrote lots of code; React, MapboxGL, Webpack, etc.
              </ExpInfo>
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2>Projects:</h2>
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
                ]}
              >
                Wrote lots of code; React, MapboxGL, Webpack, etc.
              </ExpInfo>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
