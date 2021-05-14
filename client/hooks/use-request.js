import axios from 'axios';
import { useState } from 'react';

const useRequest =  ({ url, method, body, onSuccess}) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url,body);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (e) {
      setErrors(
        <div className="alert alert-danger">
        <h4>Error:</h4>
        <ul className="my-0">
        {e.response.data.map(err=><li key={err.message}>{err.message}</li>)}
        </ul>
      </div>
      )
    }
  }

  return { errors, doRequest }
}

export default useRequest;