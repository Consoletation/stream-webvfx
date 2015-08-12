using UnityEngine;
using System.Collections;
using UnityStandardAssets.ImageEffects;

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

	void Awake()
	{
		m_camPiv = m_camPiv.GetInstance ("m_camPiv");
		m_negativeEffect = m_negativeEffect.GetInstance ("m_mainCam");
	}

	void Start () {
		SoundReactive.RegisterListener (this);
		Screen.fullScreen = true;
	}

	private float m_cFrequency;
	private float m_max;

	public void AudioHandle(AudioData data)
	{
		UpdateNegativeEffect (data);
		CreateObjects ((int)data.normalSpectrum);

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


		float valueTo = data.normalSpectrum > data.maxNormalSpectrum * 0.2f  ? 100 : 0;
		
		m_cFrequency += (valueTo - m_cFrequency) * 0.4f;
		
		float map = Utils.FloatMap (m_cFrequency, 0, 100, 0, 1);
		
		m_negativeEffect.m_negative = map;
	}
	
	void Update()
	{
		if(Input.GetKeyDown(KeyCode.Space))
			m_haveMessage = !m_haveMessage;

		//UpdateCameraRotation ();
	}


}
