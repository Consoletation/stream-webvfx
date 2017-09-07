using UnityEngine;
using System.Collections;

public class CameraMovement : MonoBehaviour  , ISoundReact{
	
	private Vector3 m_rotTo;
	private Vector3 m_originalRot;
	private Vector3 m_perlinRot;
	private float r1;
	private float r2;
	private float r3;

	private float r1P;
	private float r2P;
	private float r3P;

	public int m_rots;
	private float m_maxSpec = 60;

	private Transform m_mainCam;

	private float m_pz;

	void Start()
	{
		SoundReactive.RegisterListener (this);

		r1 = Random.Range (0, 1000);
		r2 = Random.Range (0, 1000);
		r3 = Random.Range (0, 1000);

		r1P = Random.Range (0, 30) / 2000.0f;
		r2P = Random.Range (0, 30) / 2000.0f;
		r3P = Random.Range (0, 30) / 5000.0f;

		m_mainCam = transform.GetChieldFromName<Transform> ("m_mainCam");
	}


	public void AudioHandle(AudioData audio)
	{
		float nx = Mathf.PerlinNoise (r1,r1);
		float ny = Mathf.PerlinNoise (r2,r2);
		float nz = Mathf.PerlinNoise (r3,r3);

		nx = Utils.FloatMap (nx, 0, 1, -30, 30);
		ny = Utils.FloatMap (ny, 0, 1, -70, 70);
		m_pz = Utils.FloatMap (nz, 0, 1, 5, 15);

		m_perlinRot.x = nx;
		m_perlinRot.y = ny;

		m_rotTo = m_perlinRot + m_originalRot;

		transform.rotation = Quaternion.Euler(m_rotTo);

		r1 += r1P;
		r2 += r2P;
		r3 += r3P;


		if (audio.volume > 0.75f)
			m_rots += Random.Range(0,10) > 4 ? 1 : -1;

	}


	void Update()
	{
		m_originalRot.y += ((m_rots * 180) - m_originalRot.y) * 0.1f;
		Vector3 camPos = m_mainCam.localPosition;
		camPos.z = -m_pz;
		m_mainCam.localPosition = camPos;



	}
}
