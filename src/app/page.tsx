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
              <article className="mt-4">
                <h3 className="text-xl font-bold">
                  Senior Software Engineer @ Savage X Fenty
                </h3>
                <p className="text-slate-400 mt-2">September 2021 - May 2023</p>
                <p className="mt-2">
                  At Savage X Fenty, I worked with an amazing team, solving
                  problems at scale. SxF is a big ecommerce company that
                  operates all over the globe. Rihanna.
                </p>

                <ul className="mt-4 flex flex-wrap">
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    JavaScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    TypeScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    React.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Redux
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Next.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    MySQL
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    CMS
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Ecom
                  </li>

                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Localization
                  </li>
                </ul>
              </article>
            </li>
            <li>
              <article className="mt-4">
                <h3 className="text-xl font-bold">
                  Front End Engineering Team Lead @ Billups
                </h3>
                <p className="text-slate-400 mt-2">
                  January 2021 - August 2021
                </p>
                <p className="mt-2">
                  Led small front end engineering team in planning, building,
                  and maintaining multiple web applications.
                </p>

                <ul className="mt-4 flex flex-wrap">
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    JavaScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    TypeScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    React.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Redux
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    RxJS
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Golang
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    MySQL
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    MapboxGL
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    AG Grid
                  </li>
                </ul>
              </article>
            </li>
            <li>
              <article className="mt-4">
                <h3 className="text-xl font-bold">
                  Front End Engineer @ Billups
                </h3>
                <p className="text-slate-400 mt-2">
                  November 2018 - January 2021
                </p>
                <p className="mt-2">
                  Wrote lots of code. Typescript, Redux, RxJS!
                </p>

                <ul className="mt-4 flex flex-wrap">
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    JavaScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    TypeScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    React.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Jest
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Redux
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    RxJS
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    MySQL
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    MapboxGL
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Node.js
                  </li>
                </ul>
              </article>
            </li>
            <li>
              <article className="mt-4">
                <h3 className="text-xl font-bold">
                  Front End Engineer III @ Womply
                </h3>
                <p className="text-slate-400 mt-2">August 2017 - August 2018</p>
                <p className="mt-2">
                  Wrote lots of code. Typescript, Redux, RxJS!
                </p>

                <ul className="mt-4 flex flex-wrap">
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    JavaScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Angular.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Circle CI
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Protractor
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Jasmine
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Node.js
                  </li>
                </ul>
              </article>
            </li>
            <li>
              <article className="mt-4">
                <h3 className="text-xl font-bold">
                  Software Engineer I & II @ Billups
                </h3>
                <p className="text-slate-400 mt-2">April 16th - August 2017</p>
                <p className="mt-2">
                  Wrote lots of code. Typescript, Redux, RxJS!
                </p>

                <ul className="mt-4 flex flex-wrap">
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    JavaScript
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Angular.js
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Circle CI
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Protractor
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Jasmine
                  </li>
                  <li className="text-xs mr-4 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3">
                    Node.js
                  </li>
                </ul>
              </article>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
