import React, { useEffect, useState, Fragment } from "react"
import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import sources from "utils/sources"
import years from "utils/years"
import { sendMessage } from "utils/sendMessage"

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const IndexPage: NextPage = () => {

  // filters
  const [selected, setSelected] = useState(sources[0])
  const [selectedYear, setSelectedYear] = useState(years[0])

  // summary state
  const [summary, setSummary] = useState<any>(null)
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

  // sentiment state
  const [sentiment, setSentiment] = useState<any>(null)
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false)


  // react Hook For State Handler
  const [data, setData] = useState<any>(null)
  const [filteredData, setFilteredData] = useState<any>([])

  // trigger ai summary
  const addMessage = async (content: any) => {
    let titles = '';
    console.log(content);
    setIsLoadingAnswer(true)

    // get titles
    content.forEach((element: any) => {
      titles = titles + element.title + ', '
    });

    try {
      const newMessage: any = {
        role: 'user',
        // prompt engineer here
        content: 'Φτιάξε μια σύντομη περίληψη χρησιμοποιόντας τα παρακάτω κείμενα για την εταιρεία Nova: ' + titles,
      }

      const messages = [{
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.'
      }, newMessage]

      console.log(messages);

      const { data } = await sendMessage(messages)
      console.log(data);

      const reply = data.choices[0].message

      setSummary(reply)

    } catch (error) {
      console.log(error)
      // Show error when something goes wrong
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  // trigger ai sentiment
  const addSentiment = async (content: any) => {
    let titles = '';
    console.log(content);
    setIsLoadingSentiment(true)

    // get titles
    content.forEach((element: any) => {
      titles = titles + element.title + ', '
    });

    try {
      const newMessage: any = {
        role: 'user',
        // prompt engineer here
        content: 'Rate the sentiment for the company Nova on the following texts: ' + titles + 'using 3 ranks: bad, neutral, good. Reply with only one world',
      }

      const messages = [{
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.'
      }, newMessage]

      console.log(messages);

      const { data } = await sendMessage(messages)
      console.log(data);

      const reply = data.choices[0].message

      setSentiment(reply)

    } catch (error) {
      console.log(error)
      // Show error when something goes wrong
    } finally {
      setIsLoadingSentiment(false)
    }
  }


  const triggerGenerate = () => {
    addMessage(filteredData)
  }


  const triggerSentiment = () => {
    addSentiment(filteredData)
  }


  useEffect(() => {
    // clear summary and sentiment
    setSummary(null)
    setSentiment(null)

    if (data) {

      // check source
      const filteredData = data.filter((item: any): any => {
        if (selected.name === 'All') {
          return true
        } else if (item.source === selected.name) {
          return true
        } else {
          return false
        }


      });

      // check date
      const finalFitering = filteredData.filter((item: any): any => {
        if (selectedYear.name === 'All') {
          return true
        } else if (item.date.substr(item.date.length - 4) === selectedYear.name) {
          return true
        } else {
          return false
        }

      })


      setFilteredData(finalFitering)
    }

  }, [setFilteredData, selected, selectedYear])

  // Fetch Function
  useEffect(() => {
    fetch("./data.json").then(
      function (res) {
        return res.json()
      }).then(function (data) {

        // add image on data
        const dataWithImages = data.map((item: any): any => {
          const found = sources.filter(source => source.name === item.source)[0]
          return { ...item, image: found ? found.avatar : "" }

        })
        // store Data in State Data Variable
        setData(dataWithImages)
        setFilteredData(dataWithImages)
      }).catch(
        function (err) {
          console.log(err, ' error')
        }
      )
  }, [])

  return (
    <MessagesProvider>
      <Layout>
        <div className='p-12'>
          <h1 className=' text-4xl mb-2'>Filters</h1>
          <div className='flex space-x-4 justify-center'>

            <Listbox value={selected} onChange={setSelected}>
              {({ open }) => (
                <div className='w-56'>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Source</Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                      <span className="flex items-center">
                        <img src={selected.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                        <span className="ml-3 block truncate">{selected.name}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {sources.map((source) => (
                          <Listbox.Option
                            key={source.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={source}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  <img src={source.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                                  <span
                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {source.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4'
                                    )}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              )}
            </Listbox>

            <Listbox value={selectedYear} onChange={setSelectedYear}>
              {({ open }) => (
                <div className='w-56'>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Year</Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                      <span className="flex items-center">
                        <span className="ml-3 block">{selectedYear.name}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {years.map((year) => (
                          <Listbox.Option
                            key={year.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={year}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  <span
                                    className={classNames(selectedYear ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {year.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4'
                                    )}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              )}
            </Listbox>

          </div>
          <div className="flex justify-around">
            {/* Summarization */}
            <div className="my-24 w-1/2 mr-8"><h1 className='text-4xl mb-2'>AI Summary</h1>
              <p className="mb-8">What is the summary from {selected.name} during the period {selectedYear.name}?
              </p>
              <div className='flex '>
                {isLoadingAnswer ?
                  <div>
                    <svg className="mx-auto my-12 text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                      width="24" height="24">
                      <path
                        d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path
                        d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" className="text-gray-900">
                      </path>
                    </svg>
                    Generating summary for <strong>Source: {selected.name}</strong> and <strong>Year: {selectedYear.name}</strong>
                  </div> :
                  <div>
                    {summary && <div>{summary.content}</div>}
                    <button className="mt-4 bg-black hover:bg-gray-700 text-white py-2 px-4 rounded" onClick={triggerGenerate}>
                      {summary ? "Re-generate" : "Generate"}
                    </button>
                  </div>
                }
              </div>

            </div>

            {/* Sentiment */}
            <div className="my-24 w-1/2 ml-8"><h1 className='  text-4xl mb-2'>Sentiment analysis</h1>
              <p className="mb-8">How is {selected.name} talking about Nova during the period {selectedYear.name}?
              </p>
              <div className='flex '>
                {isLoadingSentiment ?
                  <div>
                    <svg className="mx-auto my-12 text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                      width="24" height="24">
                      <path
                        d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path
                        d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" className="text-gray-900">
                      </path>
                    </svg>
                    Generating sentiment for <strong>Source: {selected.name}</strong> and <strong>Year: {selectedYear.name}</strong>
                  </div> :
                  <div>
                    {sentiment && <div className="my-12">{capitalizeFirstLetter(sentiment.content)}</div>}
                    <button className="mt-4 bg-black hover:bg-gray-700 text-white py-2 px-4 rounded" onClick={triggerSentiment}>
                      {sentiment ? "Re-generate" : "Generate"}
                    </button>
                  </div>
                }
              </div>

            </div>
          </div>
          {/* Articles */}

          <div>
            <h1 className=' text-4xl mb-2'>Articles {filteredData.length !== 0 && <>({filteredData.length})</>}</h1>
            {
              filteredData.length ? filteredData.map(
                function (fdata: any) {
                  return (
                    <div className="m-12 max-w rounded overflow-hidden shadow-lg">

                      <div className="px-6 py-4">
                        <div className="flex content-center items-center">
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white m-4"
                            src={fdata.image}
                            alt=""
                          />
                          <div className="font-bold text-xl mb-2"><a href={fdata.url} target="_blank" rel="noopener noreferrer">{fdata.title}</a></div>
                        </div>
                        <p className="text-gray-700 text-base">
                          {fdata.summary}
                        </p>
                      </div>
                      <div className="px-6 pt-4 pb-2">
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{fdata.source}</span>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{fdata.date}</span>
                      </div>
                    </div>



                  )
                }
              ) : <div className="flex p-8 justify-center items-center">No results</div>
            }</div>
          {/* <MessagesList />
          <div className="fixed bottom-0 right-0 left-0">
            <MessageForm />
          </div> */}
        </div>
      </Layout >
    </MessagesProvider >
  )
}

export default IndexPage
