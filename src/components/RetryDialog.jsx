import { X, Video, Music } from "lucide-react";

function RetryDialog({

    retryTab,

    setRetryTab,

    retryStats,

    setRetryStats,

    onRetry,

    onClose

}) {

    return (

<div className="dialog-backdrop">

<div className="retry-dialog">

<div className="retry-header">

<h2>

Retry Download

</h2>

<button

className="icon-btn"

onClick={onClose}

>

<X size={20}/>

</button>

</div>

<div className="retry-tabs">

<button

className={

retryTab==="video"

?

"active"

:

""

}

onClick={()=>{

setRetryTab("video");

setRetryStats({

...retryStats,

type:"video"

});

}}

>

<Video size={16}/>

Video

</button>

<button

className={

retryTab==="audio"

?

"active"

:

""

}

onClick={()=>{

setRetryTab("audio");

setRetryStats({

...retryStats,

type:"audio"

});

}}

>

<Music size={16}/>

Audio

</button>

</div>

{

retryTab==="video"

&&

<div className="retry-options">

<div className="setting-item">

<label>

Resolution

</label>

<select

value={retryStats.quality}

onChange={(e)=>

setRetryStats({

...retryStats,

quality:e.target.value

})

}

>

<option>

highest

</option>

<option>

2160p

</option>

<option>

1440p

</option>

<option>

1080p

</option>

<option>

720p

</option>

<option>

480p

</option>

<option>

360p

</option>

</select>

</div>

<div className="setting-item">

<label>

Format

</label>

<select

value={retryStats.format}

onChange={(e)=>

setRetryStats({

...retryStats,

format:e.target.value

})

}

>

<option>

mp4

</option>

<option>

mkv

</option>

<option>

webm

</option>

</select>

</div>

</div>

}

{

retryTab==="audio"

&&

<div className="retry-options">

<div className="setting-item">

<label>

Quality

</label>

<select

value={retryStats.quality}

onChange={(e)=>

setRetryStats({

...retryStats,

quality:e.target.value

})

}

>

<option>

320

</option>

<option>

256

</option>

<option>

192

</option>

<option>

128

</option>

</select>

</div>

<div className="setting-item">

<label>

Format

</label>

<select

value={retryStats.format}

onChange={(e)=>

setRetryStats({

...retryStats,

format:e.target.value

})

}

>

<option>

mp3

</option>

<option>

opus

</option>

<option>

wav

</option>

<option>

flac

</option>

</select>

</div>

</div>

}

<div className="retry-footer">

<button

className="browse-button"

onClick={onClose}

>

Cancel

</button>

<button

className="primary-button"

onClick={onRetry}

>

Retry Download

</button>

</div>

</div>

</div>

);

}

export default RetryDialog;