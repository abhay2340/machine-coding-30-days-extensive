
import BasicAutocomplete from "./Questions/Autocomplete/BasicAutocmplete"
import MediumAutocomplete from "./Questions/Autocomplete/MediumAutocomplete"
import HardAutocomplete from "./Questions/Autocomplete/HardAutocomplete"

function App() {
  return (
    <>
  <h1>Basic</h1>
  <BasicAutocomplete/>
  <h1>Medium</h1>
  <MediumAutocomplete/>
  <h1>Hard</h1>
  <HardAutocomplete/>
  {/* <ToDoApp/> */}
    </>
  )
}

export default App
