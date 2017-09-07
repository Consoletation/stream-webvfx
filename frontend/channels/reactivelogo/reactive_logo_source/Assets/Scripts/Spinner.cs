using UnityEngine;
using System.Collections;

public class Spinner : MonoBehaviour {

	[SerializeField]
	private float m_speed = 8;
	[SerializeField]
	private float m_radius = 1;

	private Vector3 m_startPos;
	private float m_angle;
	TrailRenderer m_trail;


	void Start()
	{

		m_trail = gameObject.GetComponent<TrailRenderer> ();

		m_startPos = transform.position;
		float w = Random.Range (10, 30) / 100.0f;
		m_trail.startWidth = w;
		m_trail.endWidth = 0;
		m_trail.time = w * 4.0f;
		m_radius = w * 2;


		m_speed = Random.Range (8, 15);

		m_trail.material.color = Settings.GetRandomColor ();


	}
	void Update () {


		Vector3 posTo = m_startPos;
		posTo.x += Mathf.Cos (m_angle * Mathf.Deg2Rad) * m_radius;
		posTo.y += Mathf.Sin (m_angle * Mathf.Deg2Rad) * m_radius;
		m_startPos.z += m_speed / 1000.0f;

		transform.position = posTo;
		m_angle += m_speed;

	}
}
