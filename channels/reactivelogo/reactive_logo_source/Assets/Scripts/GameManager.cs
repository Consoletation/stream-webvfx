using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityStandardAssets.ImageEffects;
using SimpleJSON;


public class GameManager : MonoBehaviour , ISoundReact {


	[SerializeField]
	private BaseObject[] m_objects;

	private bool m_haveMessage;
	private Transform m_camPiv;
	private Negative m_negativeEffect;
	
	private float[] m_radius; 
	private int[] m_primes = new int[3]{3,7,11}; 
	
	private int m_samples = 64;
	private float m_lastSpawn;
	private float m_reloadTime = 120;
	private float m_lastTimeLoaded;
	private bool m_canLoad;
	private List<string> m_urls;


	void Awake()
	{
		m_urls = new List<string> ();
		m_camPiv = m_camPiv.GetInstance ("m_camPiv");
		m_negativeEffect = m_negativeEffect.GetInstance ("m_mainCam");
		m_canLoad = true;
		m_lastTimeLoaded = Time.time;
	}

	void Start () {
		SoundReactive.RegisterListener (this);
		Screen.fullScreen = true;

		CheckPictures ();
	}

	private float m_cFrequency;
	private float m_max;

	public void AudioHandle(AudioData data)
	{
		UpdateNegativeEffect (data);
		CreateObjects ((int)data.volume * 100);
	}

	private void CreateObjects(int value)
	{
		if (Time.time < m_lastSpawn + 0.3f)
			return;

		int i = 0;

		foreach (int num in m_primes) {
		
			if(value % num == 0)
			{
				m_lastSpawn = Time.time;
				Instantiate(m_objects[i]);
				break;
			}

			i++;
		}
	}
	
	private void UpdateNegativeEffect(AudioData data)
	{	
		float valueTo = data.volume > 0.7f  ? 100 : 0;
		
		m_cFrequency += (valueTo - m_cFrequency) * 0.4f;
		
		float map = Utils.FloatMap (m_cFrequency, 0, 100, 0, 1);
		
		m_negativeEffect.m_negative = map;
	}
	
	void Update()
	{
		if(Input.GetKeyDown(KeyCode.Space))
			m_haveMessage = !m_haveMessage;

		//UpdateCameraRotation ();


		if (m_canLoad && Time.time > m_lastTimeLoaded + m_reloadTime)
			CheckPictures ();
	}


	private void CheckPictures()
	{
		Debug.Log ("--------- // check pictures // ---------");

		m_canLoad = false;
		StartCoroutine (LoadJson ());
	}

	IEnumerator LoadJson() {

		var json = JSON.Parse ("{}");
		int len = 0;
		List<string> arr = new List<string> ();
		string url = "";

		WWW www;

		/// Faces

		/*www = new WWW("http://localhost:8080/assets/faces.json");
		
		// Wait for download to complete
		yield return www;

		json = JSON.Parse (www.text);

		len = json.Count;

		for (int i = 0; i < len; i++) {

			url = "http://localhost:8080/assets/faces/" + json [i] ["image"];

			if(!CheckUrl(url))
				arr.Add (url);
		}*/

		////Instragram Pictures

		www = new WWW("http://localhost:8080/assets/instagram_photos.json");

		yield return www;
		
		json = JSON.Parse (www.text);
		len = json.Count;

		Debug.Log ("len2: " + len);

		for (int i = 0; i < len; i++)
		{
			url = "http://localhost:8080/assets/instagram_photos/" + json[i]["filename"];
			
			if(!CheckUrl(url))
				arr.Add (url);
		}

		if(arr.Count > 0)
			StartCoroutine( LoadImage(arr.ToArray(), 0));
	}

	private bool CheckUrl(string url)
	{
		foreach (string u in m_urls) {
		
			if(u == url)
				return true;
		}

		return false;
	}

	IEnumerator LoadImage(string[] url , int count) {

		Debug.Log ("Load Image");

		m_urls.Add (url[count]);
		WWW www = new WWW(url[count]);

		yield return www;

		if (count < url.Length - 1) {

			if (www.bytesDownloaded > 200)
				m_negativeEffect.AddPictures (www.texture);

			count++;
			StartCoroutine (LoadImage (url, count));
		} 
		else 
		{
			m_lastTimeLoaded = Time.time;
			m_canLoad = true;
		}
	}


}
