import Backdrop from 'backdrop/backdrop'
import Dialog from 'dialog/dialog'
import Loading from 'loading/loading'
import Picker from 'picker/picker'
import PickerCity from 'picker-city/picker-city'
import Prompt from 'prompt/prompt'
import Rater from 'rater/rater'
import Toast from 'toast/toast'



export default function() {
	return {
		$wuxBackdrop   : Backdrop, 
		$wuxDialog     : Dialog, 
		$wuxLoading    : Loading, 
		$wuxPicker     : Picker, 
		$wuxPickerCity : PickerCity, 
		$wuxPrompt     : Prompt, 
		$wuxRater      : Rater,  
		$wuxToast      : Toast, 
	}
}